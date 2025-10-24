import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { DatabaseModule, User, QuizAttempt, UserImage } from '@app/database';
import { AuthModule } from '@app/auth';
import { CloudinaryModule } from '@app/cloudinary';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User, QuizAttempt, UserImage]),
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
