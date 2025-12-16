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
import { Goal } from '@goals/entities/goal.entity';

@Entity('daily_tasks')
export class DailyTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'TODO' })
  status: string; // 'TODO', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'

  @Column({ type: 'int', default: 0 })
  completionPercentage: number; // 0-100

  @Column({ type: 'int', default: 1 })
  priority: number; // 1-5

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  actualHours: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  resources: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.dailyTasks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Goal, (goal) => goal.tasks, { nullable: true })
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  @Column('uuid', { nullable: true })
  goal_id: string;
}
