import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { QuizModule } from './quiz.module';

async function bootstrap() {
  const app = await NestFactory.create(QuizModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3003,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
  
  console.log('🚀 Quiz Service is running on port 3003');
}
bootstrap();
