import { NestFactory } from '@nestjs/core';
import { StatisticModule } from './statistic.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(StatisticModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 8888,
    },
  });

  app.enableCors();
  app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
