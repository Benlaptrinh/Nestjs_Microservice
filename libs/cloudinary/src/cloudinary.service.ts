import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    // Convert buffer to base64 data URI
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    try {
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'quiz-app/avatars',
        resource_type: 'image',
        timeout: 60000,
        transformation: [
          { width: 500, height: 500, crop: 'fill' },
          { quality: 'auto' },
        ],
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async deleteMultipleImages(publicIds: string[]): Promise<any> {
    const deletePromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId),
    );
    return Promise.all(deletePromises);
  }

  extractPublicId(url: string): string {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567/quiz-app/avatars/abc123.jpg
    // Returns: quiz-app/avatars/abc123
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : '';
  }
}
