import { Module } from '@nestjs/common';
import { QuizGatewayController } from './quiz-gateway.controller';
import { QuizGatewayService } from './quiz-gateway.service';

@Module({
  imports: [],
  controllers: [QuizGatewayController],
  providers: [QuizGatewayService],
})
export class QuizGatewayModule {}
