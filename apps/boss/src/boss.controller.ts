import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BossService } from './boss.service';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { UserRole } from '@app/database';

@Controller('boss')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BOSS)
export class BossController {
  constructor(private readonly bossService: BossService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.bossService.getDashboardOverview();
  }

  @Get('analytics/users')
  async getUserAnalytics() {
    return this.bossService.getUserAnalytics();
  }

  @Get('analytics/quizzes')
  async getQuizAnalytics() {
    return this.bossService.getQuizAnalytics();
  }

  @Get('top-performers')
  async getTopPerformers(@Query('limit') limit?: string) {
    return this.bossService.getTopPerformers(limit ? parseInt(limit) : 10);
  }

  @Get('recent-activities')
  async getRecentActivities(@Query('limit') limit?: string) {
    return this.bossService.getRecentActivities(limit ? parseInt(limit) : 20);
  }

  @Get('report/full')
  async getFullReport() {
    return this.bossService.getFullReport();
  }

  // Microservice patterns
  @MessagePattern({ cmd: 'get_dashboard' })
  async getDashboardByMessage() {
    return this.bossService.getDashboardOverview();
  }

  @MessagePattern({ cmd: 'get_full_report' })
  async getFullReportByMessage() {
    return this.bossService.getFullReport();
  }
}
