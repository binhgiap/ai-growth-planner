import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'WEEKLY', 'MONTHLY', 'FINAL'

  @Column({ type: 'timestamp' })
  generatedDate: Date;

  @Column({ type: 'timestamp' })
  reportPeriodStart: Date;

  @Column({ type: 'timestamp' })
  reportPeriodEnd: Date;

  @Column({ type: 'int', default: 0 })
  overallProgress: number; // 0-100

  @Column({ type: 'jsonb', nullable: true })
  strengths: string[];

  @Column({ type: 'jsonb', nullable: true })
  weaknesses: string[];

  @Column({ type: 'jsonb', nullable: true })
  achievements: string[];

  @Column({ type: 'jsonb', nullable: true })
  areasForImprovement: string[];

  @Column({ type: 'text', nullable: true })
  executiveSummary: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'jsonb', nullable: true })
  metrics: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  nextSteps: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;
}
