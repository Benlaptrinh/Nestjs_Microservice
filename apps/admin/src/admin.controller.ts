import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { UserRole } from '@app/database';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User Management
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminService.updateUserRole(id, role);
  }

  @Patch('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  // Quiz Management
  @Get('quizzes')
  async getAllQuizzes() {
    return this.adminService.getAllQuizzesAdmin();
  }

  @Put('quizzes/:id')
  async updateQuiz(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateQuiz(id, updateData);
  }

  @Delete('quizzes/:id')
  async deleteQuiz(@Param('id') id: string) {
    return this.adminService.deleteQuiz(id);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }

  // Statistics
  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  // Microservice patterns
  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsersByMessage() {
    return this.adminService.getAllUsers();
  }

  @MessagePattern({ cmd: 'get_system_stats' })
  async getSystemStatsByMessage() {
    return this.adminService.getSystemStats();
  }
}
