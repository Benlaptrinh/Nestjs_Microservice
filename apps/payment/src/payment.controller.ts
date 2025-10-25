import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    return this.paymentService.getUserSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getUserTransactions(@Request() req) {
    return this.paymentService.getUserTransactions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.paymentService.createOrder(req.user.id, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture-order')
  async captureOrder(@Request() req, @Body() captureOrderDto: CaptureOrderDto) {
    return this.paymentService.captureOrder(req.user.id, captureOrderDto);
  }
}
