import { Test, TestingModule } from '@nestjs/testing';
import { QuizGatewayController } from './quiz-gateway.controller';
import { QuizGatewayService } from './quiz-gateway.service';

describe('QuizGatewayController', () => {
  let quizGatewayController: QuizGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QuizGatewayController],
      providers: [QuizGatewayService],
    }).compile();

    quizGatewayController = app.get<QuizGatewayController>(QuizGatewayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(quizGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
