import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Quiz, Question, UserRole } from '@app/database';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  // User Management
  async getAllUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = newRole;
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
    };
  }

  // Quiz Management
  async getAllQuizzesAdmin() {
    return this.quizRepository.find({
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateQuiz(quizId: string, updateData: Partial<Quiz>) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    Object.assign(quiz, updateData);
    return this.quizRepository.save(quiz);
  }

  async deleteQuiz(quizId: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    await this.quizRepository.remove(quiz);
    return { message: 'Quiz deleted successfully' };
  }

  async deleteQuestion(questionId: string) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.questionRepository.remove(question);
    return { message: 'Question deleted successfully' };
  }

  // Statistics
  async getSystemStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const totalQuizzes = await this.quizRepository.count();
    const activeQuizzes = await this.quizRepository.count({
      where: { isActive: true },
    });

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole,
      },
      quizzes: {
        total: totalQuizzes,
        active: activeQuizzes,
      },
    };
  }
}
