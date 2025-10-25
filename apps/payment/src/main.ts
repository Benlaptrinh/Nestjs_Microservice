import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PaymentModule } from './payment.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  const port = process.env.PAYMENT_PORT || 3006;
  await app.listen(port);
  
  console.log(`Payment service is running on: http://localhost:${port}`);
}
bootstrap();
