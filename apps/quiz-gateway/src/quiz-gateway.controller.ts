import { Controller, Get } from '@nestjs/common';
import { QuizGatewayService } from './quiz-gateway.service';

@Controller()
export class QuizGatewayController {
  constructor(private readonly quizGatewayService: QuizGatewayService) {}

  @Get()
  getHello(): string {
    return this.quizGatewayService.getHello();
  }
}
