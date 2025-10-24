import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Quiz, Question, QuizAttempt, Answer, UserImage } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'quiz_db'),
        entities: [User, Quiz, Question, QuizAttempt, Answer, UserImage],
        synchronize: configService.get('DB_SYNC', true),
        logging: configService.get('DB_LOGGING', true),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
