import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  CREDIT_CARD = 'CREDIT_CARD',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  subscriptionId: number;

  @ManyToOne(() => Subscription, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ unique: true })
  paypalOrderId: string;

  @Column({ nullable: true })
  paypalCaptureId: string;

  @Column({ nullable: true })
  payerId: string; // PayPal Payer ID

  @Column({ nullable: true })
  payerEmail: string; // Email người thanh toán

  @Column({ nullable: true })
  payerName: string; // Tên người thanh toán

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.PAYPAL,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // Lưu lỗi nếu thanh toán thất bại

  @Column({ type: 'json', nullable: true })
  metadata: any; // Lưu plan info, response từ PayPal, etc.

  @Column({ type: 'json', nullable: true })
  paypalResponse: any; // Full response từ PayPal khi capture

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date; // Ngày hoàn tiền nếu có
}
