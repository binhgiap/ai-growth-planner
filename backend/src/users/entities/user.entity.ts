import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Goal } from '@goals/entities/goal.entity';
import { DailyTask } from '@daily-tasks/entities/daily-task.entity';
import { ProgressLog } from '@progress-tracking/entities/progress-log.entity';
import { Report } from '@reports/entities/report.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentRole: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetRole: string;

  @Column({ type: 'text', array: true, default: () => "'{}'", nullable: true })
  skills: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'", nullable: true })
  targetSkills: string[];

  @Column({ type: 'int', default: 40 })
  hoursPerWeek: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  bio: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToMany(() => DailyTask, (task) => task.user)
  dailyTasks: DailyTask[];

  @OneToMany(() => ProgressLog, (log) => log.user)
  progressLogs: ProgressLog[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];
}
