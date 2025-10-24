import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { BossModule } from './boss.module';

async function bootstrap() {
  const app = await NestFactory.create(BossModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3007,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3007);
  
  console.log('🚀 Boss Service is running on port 3007');
}
bootstrap();
