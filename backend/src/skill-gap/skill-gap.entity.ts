import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

interface GapDetail {
  skill: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  currentLevel: number;
  targetLevel: number;
}

/**
 * SkillGap Entity - Stores skill gap analysis results
 */
@Entity('skill_gaps')
@Index(['user_id'])
@Index(['user_id', 'created_at'])
export class SkillGap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar')
  current_level: string;

  @Column('varchar')
  target_level: string;

  @Column('jsonb')
  current_skills: string[];

  @Column('jsonb')
  target_skills: string[];

  @Column('jsonb')
  gaps: GapDetail[];

  @Column('jsonb')
  prioritized_gaps: string[];

  @Column('text')
  summary: string;

  @Column('int', { default: 0 })
  total_gap_count: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
