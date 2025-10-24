import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Enable CORS for React frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // React default ports
    credentials: true,
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
  
  console.log('🚀 Auth Service is running on port 3001');
}
bootstrap();
