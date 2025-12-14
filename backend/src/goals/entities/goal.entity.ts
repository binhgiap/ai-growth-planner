import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@users/entities/user.entity';
import { DailyTask } from '@daily-tasks/entities/daily-task.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'OBJECTIVE' or 'KEY_RESULT'

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'varchar', length: 50, default: 'NOT_STARTED' })
  status: string; // 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  targetDate: Date;

  @Column({ type: 'int', default: 1 })
  priority: number; // 1-5

  @Column({ type: 'jsonb', nullable: true })
  metrics: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.goals)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @OneToMany(() => DailyTask, (task) => task.goal)
  tasks: DailyTask[];
}
