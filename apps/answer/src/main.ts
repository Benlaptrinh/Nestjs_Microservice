import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AnswerModule } from './answer.module';

async function bootstrap() {
  const app = await NestFactory.create(AnswerModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3004,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);
  
  console.log('🚀 Answer Service is running on port 3004');
}
bootstrap();
