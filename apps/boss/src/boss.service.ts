import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Quiz, QuizAttempt, UserRole } from '@app/database';

@Injectable()
export class BossService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
  ) {}

  // Dashboard Overview
  async getDashboardOverview() {
    const totalUsers = await this.userRepository.count();
    const totalQuizzes = await this.quizRepository.count();
    const totalAttempts = await this.quizAttemptRepository.count();
    
    const completedAttempts = await this.quizAttemptRepository.count({
      where: { status: 'completed' as any },
    });

    const avgScore = await this.quizAttemptRepository
      .createQueryBuilder('attempt')
      .select('AVG(attempt.score)', 'average')
      .where('attempt.status = :status', { status: 'completed' })
      .getRawOne();

    return {
      overview: {
        totalUsers,
        totalQuizzes,
        totalAttempts,
        completedAttempts,
        averageScore: parseFloat(avgScore?.average) || 0,
      },
    };
  }

  // User Analytics
  async getUserAnalytics() {
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    const inactiveUsers = await this.userRepository.count({
      where: { isActive: false },
    });

    return {
      userAnalytics: {
        byRole: usersByRole,
        active: activeUsers,
        inactive: inactiveUsers,
      },
    };
  }

  // Quiz Analytics
  async getQuizAnalytics() {
    const quizPerformance = await this.quizAttemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.quiz', 'quiz')
      .select('quiz.id', 'quizId')
      .addSelect('quiz.title', 'quizTitle')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .addSelect('AVG(attempt.score)', 'averageScore')
      .addSelect('MAX(attempt.score)', 'maxScore')
      .addSelect('MIN(attempt.score)', 'minScore')
      .where('attempt.status = :status', { status: 'completed' })
      .groupBy('quiz.id')
      .addGroupBy('quiz.title')
      .getRawMany();

    return {
      quizAnalytics: quizPerformance.map((item) => ({
        quizId: item.quizId,
        quizTitle: item.quizTitle,
        totalAttempts: parseInt(item.totalAttempts),
        averageScore: parseFloat(item.averageScore).toFixed(2),
        maxScore: parseInt(item.maxScore),
        minScore: parseInt(item.minScore),
      })),
    };
  }

  // Top Performers
  async getTopPerformers(limit: number = 10) {
    const topStudents = await this.quizAttemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.fullName', 'fullName')
      .addSelect('user.email', 'email')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .addSelect('AVG(attempt.score)', 'averageScore')
      .addSelect('SUM(attempt.score)', 'totalScore')
      .where('attempt.status = :status', { status: 'completed' })
      .andWhere('user.role = :role', { role: UserRole.USER })
      .groupBy('user.id')
      .addGroupBy('user.fullName')
      .addGroupBy('user.email')
      .orderBy('AVG(attempt.score)', 'DESC')
      .limit(limit)
      .getRawMany();

    return {
      topPerformers: topStudents.map((item, index) => ({
        rank: index + 1,
        userId: item.userId,
        fullName: item.fullName,
        email: item.email,
        totalAttempts: parseInt(item.totalAttempts),
        averageScore: parseFloat(item.averageScore).toFixed(2),
        totalScore: parseInt(item.totalScore),
      })),
    };
  }

  // Recent Activities
  async getRecentActivities(limit: number = 20) {
    const recentAttempts = await this.quizAttemptRepository.find({
      relations: ['user', 'quiz'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      recentActivities: recentAttempts.map((attempt) => ({
        id: attempt.id,
        userName: attempt.user.fullName,
        userEmail: attempt.user.email,
        quizTitle: attempt.quiz.title,
        score: attempt.score,
        status: attempt.status,
        completedAt: attempt.completedAt,
        createdAt: attempt.createdAt,
      })),
    };
  }

  // Full Report
  async getFullReport() {
    const [overview, userAnalytics, quizAnalytics, topPerformers, recentActivities] = 
      await Promise.all([
        this.getDashboardOverview(),
        this.getUserAnalytics(),
        this.getQuizAnalytics(),
        this.getTopPerformers(10),
        this.getRecentActivities(20),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      ...overview,
      ...userAnalytics,
      ...quizAnalytics,
      ...topPerformers,
      ...recentActivities,
    };
  }
}
