import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreateOrderDto, CaptureOrderDto } from './dto/payment.dto';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('plans')
  async getPlans() {
    return this.paymentService.getSubscriptionPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getUserSubscription(@Request() req) {
    return this.paymentService.getUserSubscription(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getUserTransactions(@Request() req) {
    return this.paymentService.getUserTransactions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.paymentService.createOrder(req.user.userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture-order')
  async captureOrder(@Request() req, @Body() captureOrderDto: CaptureOrderDto) {
    return this.paymentService.captureOrder(req.user.userId, captureOrderDto);
  }

  // PayPal callback endpoints
  @Get('success')
  async paymentSuccess(@Query('token') token: string, @Query('PayerID') payerId: string, @Res() res: Response) {
    // Return HTML page với instructions để capture order
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Success</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .success { color: #28a745; font-size: 48px; }
          .info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
          .button {
            background: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          .button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="success">✅</div>
        <h1>Payment Approved!</h1>
        <p>Thank you for your payment. Your order has been approved by PayPal.</p>
        
        <div class="info">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> <code>${token}</code></p>
          <p><strong>Payer ID:</strong> <code>${payerId}</code></p>
        </div>

        <div class="info">
          <h3>Next Step: Capture Payment</h3>
          <p>To complete the transaction, call the capture endpoint:</p>
          <pre style="text-align: left; background: #282c34; color: #abb2bf; padding: 15px; border-radius: 5px; overflow-x: auto;">
POST http://localhost:3008/payment/capture-order
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "orderId": "${token}"
}</pre>
          <p><small>Replace YOUR_JWT_TOKEN with your authentication token</small></p>
        </div>

        <button class="button" onclick="window.close()">Close Window</button>
      </body>
      </html>
    `;
    
    res.send(html);
  }

  @Get('cancel')
  async paymentCancel(@Query('token') token: string, @Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Cancelled</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .cancel { color: #dc3545; font-size: 48px; }
          .info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button {
            background: #6c757d;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          .button:hover { background: #5a6268; }
        </style>
      </head>
      <body>
        <div class="cancel">❌</div>
        <h1>Payment Cancelled</h1>
        <p>Your payment has been cancelled. No charges have been made.</p>
        
        <div class="info">
          <p>Order ID: <code>${token}</code></p>
          <p>You can try again or choose a different payment method.</p>
        </div>

        <button class="button" onclick="window.close()">Close Window</button>
      </body>
      </html>
    `;
    
    res.send(html);
  }
}
