import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ImageType {
  AVATAR = 'avatar',
  GALLERY = 'gallery',
  QUIZ = 'quiz',
  CHAT = 'chat',
  OTHER = 'other',
}

@Entity('user_images')
export class UserImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  url: string;

  @Column()
  publicId: string; // Cloudinary public_id for deletion

  @Column({ nullable: true })
  originalName: string;

  @Column({
    type: 'enum',
    enum: ImageType,
    default: ImageType.OTHER,
  })
  type: ImageType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  size: number; // File size in bytes

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
