import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  Transaction,
  SubscriptionPlan,
  SubscriptionStatus,
  TransactionStatus,
  PaymentMethod,
} from '@app/database/entities';
import { Client, Environment, OrdersController, CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';
import { CreateOrderDto, CaptureOrderDto } from './dto/payment.dto';
import { SUBSCRIPTION_PLANS } from './constants/subscription-plans';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private paypalClient: Client;
  private ordersController: OrdersController;

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private configService: ConfigService,
  ) {
    this.initializePayPal();
  }

  private initializePayPal() {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const environment = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    this.paypalClient = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      environment: environment === 'production' ? Environment.Production : Environment.Sandbox,
    });

    this.ordersController = new OrdersController(this.paypalClient);

    this.logger.log(`PayPal client initialized in ${environment} mode`);
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { plan, amount, description } = createOrderDto;

    // Get plan pricing
    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) {
      throw new BadRequestException('Invalid subscription plan');
    }

    if (plan === SubscriptionPlan.FREE) {
      throw new BadRequestException('Cannot create payment for free plan');
    }

    const orderAmount = amount || planConfig.price;

    try {
      // Create PayPal order
      this.logger.log(`Creating PayPal order for user ${userId}, plan ${plan}, amount ${orderAmount}`);
      
      const collect = {
        body: {
          intent: CheckoutPaymentIntent.Capture,
          purchaseUnits: [
            {
              amount: {
                currencyCode: 'USD',
                value: orderAmount.toFixed(2),
              },
              description: description || `${planConfig.name} Subscription`,
            },
          ],
          applicationContext: {
            returnUrl: `${this.configService.get('APP_URL')}/payment/success`,
            cancelUrl: `${this.configService.get('APP_URL')}/payment/cancel`,
          },
        },
      };

      this.logger.log(`Calling PayPal API...`);
      const { result: order } = await this.ordersController.createOrder(collect);
      this.logger.log(`PayPal API response received: ${order.id}`);

      // Save transaction to database
      const transaction = this.transactionRepository.create({
        userId,
        paypalOrderId: order.id!,
        amount: orderAmount,
        currency: 'USD',
        paymentMethod: PaymentMethod.PAYPAL,
        status: TransactionStatus.PENDING,
        description: description || `${planConfig.name} Subscription`,
        metadata: { plan },
      });

      await this.transactionRepository.save(transaction);

      this.logger.log(`Order created: ${order.id} for user ${userId}`);

      return {
        orderId: order.id!,
        approvalUrl: order.links?.find((link) => link.rel === 'approve')?.href || '',
        amount: orderAmount,
        currency: 'USD',
      };
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create PayPal order');
    }
  }

  async captureOrder(userId: string, captureOrderDto: CaptureOrderDto) {
    const { orderId } = captureOrderDto;

    // Find transaction
    const transaction = await this.transactionRepository.findOne({
      where: { paypalOrderId: orderId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Transaction already completed');
    }

    try {
      // Capture PayPal order
      const { result: captureData } = await this.ordersController.captureOrder({
        id: orderId,
        prefer: 'return=representation',
      });

      this.logger.log(`PayPal capture successful: ${captureData.id}`);

      // Extract payer information from PayPal response
      const payer = captureData.payer;
      const purchaseUnit = captureData.purchaseUnits?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];

      // Update transaction with full details
      transaction.status = TransactionStatus.COMPLETED;
      transaction.paypalCaptureId = captureData.id!;
      if (payer?.payerId) transaction.payerId = payer.payerId;
      if (payer?.emailAddress) transaction.payerEmail = payer.emailAddress;
      if (payer?.name) {
        transaction.payerName = `${payer.name.givenName || ''} ${payer.name.surname || ''}`.trim();
      }
      transaction.completedAt = new Date();
      transaction.paypalResponse = captureData; // Lưu full response để trace lại

      // Update amount nếu có từ capture response
      if (capture?.amount?.value) {
        transaction.amount = parseFloat(capture.amount.value);
      }

      await this.transactionRepository.save(transaction);

      this.logger.log(`Transaction updated with payer info: ${transaction.payerEmail}`);

      // Create or update subscription
      const plan = transaction.metadata.plan as SubscriptionPlan;
      const planConfig = SUBSCRIPTION_PLANS[plan];

      let subscription = await this.subscriptionRepository.findOne({
        where: { userId, status: SubscriptionStatus.ACTIVE },
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planConfig.duration);

      if (subscription) {
        // Extend existing subscription
        subscription.plan = plan;
        subscription.endDate = endDate;
        subscription.price = transaction.amount;
      } else {
        // Create new subscription
        subscription = this.subscriptionRepository.create({
          userId,
          plan,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          price: transaction.amount,
          paypalSubscriptionId: orderId,
        });
      }

      await this.subscriptionRepository.save(subscription);

      this.logger.log(`Order captured: ${orderId} for user ${userId}`);

      return {
        success: true,
        message: 'Payment captured successfully',
        transaction: {
          id: transaction.id,
          orderId: transaction.paypalOrderId,
          captureId: transaction.paypalCaptureId,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          payerEmail: transaction.payerEmail,
          payerName: transaction.payerName,
          completedAt: transaction.completedAt,
        },
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          price: subscription.price,
        },
      };
    } catch (error) {
      // Update transaction as failed
      transaction.status = TransactionStatus.FAILED;
      transaction.errorMessage = error.message;
      await this.transactionRepository.save(transaction);

      this.logger.error(`Failed to capture order: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to capture PayPal order');
    }
  }

  async getUserSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      return {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        features: SUBSCRIPTION_PLANS.FREE.features,
      };
    }

    // Check if subscription is expired
    if (subscription.endDate && new Date() > subscription.endDate) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(subscription);
    }

    const planConfig = SUBSCRIPTION_PLANS[subscription.plan];

    return {
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      features: planConfig.features,
    };
  }

  async getUserTransactions(userId: string) {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['subscription'],
    });

    // Format response để dễ đọc hơn
    return transactions.map((transaction) => ({
      id: transaction.id,
      orderId: transaction.paypalOrderId,
      captureId: transaction.paypalCaptureId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      description: transaction.description,
      plan: transaction.metadata?.plan,
      payerEmail: transaction.payerEmail,
      payerName: transaction.payerName,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
      refundedAt: transaction.refundedAt,
      errorMessage: transaction.errorMessage,
    }));
  }

  async getSubscriptionPlans() {
    return Object.entries(SUBSCRIPTION_PLANS).map(([key, value]) => ({
      plan: key,
      ...value,
    }));
  }
}
