import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, Question } from '@app/database';
import { CreateQuizDto, CreateQuestionDto } from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async createQuiz(createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepository.create(createQuizDto);
    return this.quizRepository.save(quiz);
  }

  async getAllQuizzes() {
    return this.quizRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getQuizById(id: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Hide correct answers in questions
    const questionsWithoutAnswers = quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      points: q.points,
    }));

    return {
      ...quiz,
      questions: questionsWithoutAnswers,
    };
  }

  async addQuestionToQuiz(quizId: string, questionDto: CreateQuestionDto) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const question = this.questionRepository.create({
      ...questionDto,
      quizId,
    });

    return this.questionRepository.save(question);
  }

  async getQuizQuestions(quizId: string) {
    const questions = await this.questionRepository.find({
      where: { quizId },
    });

    // Return questions without correct answers for students
    return questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      points: q.points,
    }));
  }

  async getQuestionWithAnswer(questionId: string) {
    return this.questionRepository.findOne({
      where: { id: questionId },
    });
  }
}
