import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, QuizAttempt, UserRole, UserImage, ImageType } from '@app/database';
import { CloudinaryService } from '@app/cloudinary';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.USER },
      select: ['id', 'email', 'fullName', 'avatar', 'role', 'createdAt'],
      relations: ['images'],
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    return {
      ...user,
      totalImages: user.images?.length || 0,
    };
  }

  async updateProfile(userId: string, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.USER },
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    // Không cho phép thay đổi role qua API này
    delete updateData.role;
    delete updateData.password;

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['images'],
    });

    if (!updatedUser) {
      throw new NotFoundException('Student not found after update');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      totalImages: updatedUser.images?.length || 0,
    };
  }

  async getQuizHistory(userId: string) {
    const attempts = await this.quizAttemptRepository.find({
      where: { userId },
      relations: ['quiz'],
      order: { createdAt: 'DESC' },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    }));
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.USER },
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = this.cloudinaryService.extractPublicId(user.avatar);
      await this.cloudinaryService.deleteImage(publicId);
    }

    // Upload new avatar
    const result = await this.cloudinaryService.uploadImage(file);
    user.avatar = result.secure_url;
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
    };
  }

  async uploadMultipleImages(userId: string, files: Express.Multer.File[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.USER },
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    // Upload all images in parallel
    const uploadPromises = files.map((file) =>
      this.cloudinaryService.uploadImage(file),
    );

    const results = await Promise.all(uploadPromises);

    // Save image records to database
    const imageEntities = results.map((result, index) =>
      this.userImageRepository.create({
        userId: user.id,
        url: result.secure_url,
        publicId: result.public_id,
        originalName: files[index].originalname,
        type: ImageType.GALLERY,
        size: result.bytes,
        width: result.width,
        height: result.height,
      }),
    );

    await this.userImageRepository.save(imageEntities);

    // Get total images count
    const totalImages = await this.userImageRepository.count({
      where: { userId: user.id },
    });

    return {
      userId: user.id,
      totalUploaded: results.length,
      totalImages,
      newImages: imageEntities.map((entity) => ({
        id: entity.id,
        url: entity.url,
        originalName: entity.originalName,
        type: entity.type,
        size: entity.size,
        width: entity.width,
        height: entity.height,
        createdAt: entity.createdAt,
      })),
    };
  }

  async getUserImages(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.USER },
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    const images = await this.userImageRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      userId: user.id,
      totalImages: images.length,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        originalName: img.originalName,
        type: img.type,
        size: img.size,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
      })),
    };
  }

  async deleteImages(userId: string, imageIds: string[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.USER },
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    // Find images to delete
    const images = await this.userImageRepository.find({
      where: imageIds.map((id) => ({ id, userId })),
    });

    if (images.length === 0) {
      throw new NotFoundException('No images found to delete');
    }

    // Delete from Cloudinary
    const publicIds = images.map((img) => img.publicId);
    await this.cloudinaryService.deleteMultipleImages(publicIds);

    // Delete from database
    await this.userImageRepository.remove(images);

    // Get remaining count
    const remainingCount = await this.userImageRepository.count({
      where: { userId },
    });

    return {
      userId: user.id,
      deletedCount: images.length,
      remainingImages: remainingCount,
    };
  }
}
