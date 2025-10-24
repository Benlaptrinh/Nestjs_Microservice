import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { QuizService } from './quiz.service';
import { CreateQuizDto, CreateQuestionDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '@app/auth';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.createQuiz(createQuizDto);
  }

  @Get()
  async getAllQuizzes() {
    return this.quizService.getAllQuizzes();
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  async addQuestion(
    @Param('id') id: string,
    @Body() questionDto: CreateQuestionDto,
  ) {
    return this.quizService.addQuestionToQuiz(id, questionDto);
  }

  @Get(':id/questions')
  async getQuizQuestions(@Param('id') id: string) {
    return this.quizService.getQuizQuestions(id);
  }

  // Microservice patterns
  @MessagePattern({ cmd: 'get_quiz' })
  async getQuiz(data: { quizId: string }) {
    return this.quizService.getQuizById(data.quizId);
  }

  @MessagePattern({ cmd: 'get_question_with_answer' })
  async getQuestionWithAnswer(data: { questionId: string }) {
    return this.quizService.getQuestionWithAnswer(data.questionId);
  }
}
