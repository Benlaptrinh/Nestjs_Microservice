import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SubscriptionPlan } from '@app/database/entities';

export class CreateOrderDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CaptureOrderDto {
  @IsString()
  orderId: string;
}

export class WebhookDto {
  event_type: string;
  resource: any;
}
