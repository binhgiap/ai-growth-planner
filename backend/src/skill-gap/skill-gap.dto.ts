import { IsString, IsArray } from 'class-validator';

export class CreateSkillGapDto {
  @IsString()
  currentLevel: string;

  @IsString()
  targetLevel: string;

  @IsArray()
  currentSkills: string[];

  @IsArray()
  targetSkills: string[];

  @IsArray()
  gaps: Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    currentLevel: number;
    targetLevel: number;
  }>;

  @IsArray()
  prioritizedGaps: string[];

  @IsString()
  summary: string;
}

export class SkillGapResponseDto {
  id: string;
  userId: string;
  currentLevel: string;
  targetLevel: string;
  currentSkills: string[];
  targetSkills: string[];
  gaps: Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    currentLevel: number;
    targetLevel: number;
  }>;
  prioritizedGaps: string[];
  summary: string;
  totalGapCount: number;
  createdAt: Date;
  updatedAt: Date;
}
