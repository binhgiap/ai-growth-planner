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

@Entity('progress_logs')
export class ProgressLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  period: string; // 'DAILY', 'WEEKLY', 'MONTHLY'

  @Column({ type: 'timestamp' })
  periodStartDate: Date;

  @Column({ type: 'timestamp' })
  periodEndDate: Date;

  @Column({ type: 'int', default: 0 })
  tasksCompleted: number;

  @Column({ type: 'int', default: 0 })
  tasksTotal: number;

  @Column({ type: 'int', default: 0 })
  completionPercentage: number; // 0-100

  @Column({ type: 'int', default: 0 })
  goalsProgress: number; // 0-100

  @Column({ type: 'int', default: 0 })
  skillsImproved: number;

  @Column({ type: 'jsonb', nullable: true })
  highlights: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  challenges: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.progressLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;
}
