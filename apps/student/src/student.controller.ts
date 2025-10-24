import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { StudentService } from './student.service';
import { JwtAuthGuard, CurrentUser } from '@app/auth';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.studentService.getUserProfile(user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar')) // Accept optional avatar file
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: any,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    // Validate avatar if provided
    if (avatar) {
      this.validateImageFile(avatar);
    }

    return this.studentService.updateProfile(user.userId, updateData, avatar);
  }

  @Get('quiz-history')
  @UseGuards(JwtAuthGuard)
  async getQuizHistory(@CurrentUser() user: any) {
    return this.studentService.getQuizHistory(user.userId);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.validateImageFile(file);
    return this.studentService.uploadAvatar(user.userId, file);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor()) // Accept any field name
  async uploadMultipleImages(
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required (use key "file" or "files")');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed');
    }

    // Validate all files
    files.forEach((file) => this.validateImageFile(file));

    return this.studentService.uploadMultipleImages(user.userId, files);
  }

  @Get('images')
  @UseGuards(JwtAuthGuard)
  async getImages(@CurrentUser() user: any) {
    return this.studentService.getUserImages(user.userId);
  }

  @Delete('images')
  @UseGuards(JwtAuthGuard)
  async deleteImages(
    @CurrentUser() user: any,
    @Body() body: { imageIds: string[] },
  ) {
    if (!body.imageIds || body.imageIds.length === 0) {
      throw new BadRequestException('imageIds array is required');
    }

    return this.studentService.deleteImages(user.userId, body.imageIds);
  }

  private validateImageFile(file: Express.Multer.File) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File ${file.originalname}: Only image files are allowed (jpeg, png, jpg, webp)`);
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File ${file.originalname}: File size must be less than 5MB`);
    }
  }

  // Microservice patterns
  @MessagePattern({ cmd: 'get_user_profile' })
  async getUserProfileByMessage(data: { userId: string }) {
    return this.studentService.getUserProfile(data.userId);
  }

  @MessagePattern({ cmd: 'get_quiz_history' })
  async getQuizHistoryByMessage(data: { userId: string }) {
    return this.studentService.getQuizHistory(data.userId);
  }
}
