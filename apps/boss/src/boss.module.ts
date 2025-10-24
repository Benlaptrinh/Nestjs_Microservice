import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BossController } from './boss.controller';
import { BossService } from './boss.service';
import { DatabaseModule, User, Quiz, QuizAttempt } from '@app/database';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User, Quiz, QuizAttempt]),
    AuthModule,
  ],
  controllers: [BossController],
  providers: [BossService],
})
export class BossModule {}
