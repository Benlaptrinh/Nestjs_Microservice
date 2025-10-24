import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

describe('QuizController', () => {
  let quizController: QuizController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [QuizService],
    }).compile();

    quizController = app.get<QuizController>(QuizController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(quizController.getHello()).toBe('Hello World!');
    });
  });
});
