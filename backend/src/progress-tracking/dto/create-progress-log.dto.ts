import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgressLogDto {
  @ApiProperty({
    example: 'WEEKLY',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    description: 'Period type for tracking',
  })
  @IsString()
  period: string;

  @ApiProperty({
    example: '2024-01-08',
    type: 'string',
    format: 'date-time',
    description: 'Period start date',
  })
  @IsDate()
  periodStartDate: Date;

  @ApiProperty({
    example: '2024-01-14',
    type: 'string',
    format: 'date-time',
    description: 'Period end date',
  })
  @IsDate()
  periodEndDate: Date;

  @ApiPropertyOptional({
    example: 12,
    description: 'Number of tasks completed in period',
  })
  @IsNumber()
  @IsOptional()
  tasksCompleted?: number;

  @ApiPropertyOptional({
    example: 15,
    description: 'Total number of tasks for period',
  })
  @IsNumber()
  @IsOptional()
  tasksTotal?: number;

  @ApiPropertyOptional({
    example: 80,
    description: 'Overall completion percentage',
  })
  @IsNumber()
  @IsOptional()
  completionPercentage?: number;

  @ApiPropertyOptional({
    example: 75.5,
    description: 'Goals progress percentage',
  })
  @IsNumber()
  @IsOptional()
  goalsProgress?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Number of skills improved this period',
  })
  @IsNumber()
  @IsOptional()
  skillsImproved?: number;

  @ApiPropertyOptional({
    example:
      'Strong progress on system design. Completed 4 major topics. On track with all goals.',
    description: 'Summary of progress in this period',
  })
  @IsString()
  @IsOptional()
  summary?: string;
}

export class ProgressLogResponseDto {
  id: string;
  period: string;
  periodStartDate: Date;
  periodEndDate: Date;
  tasksCompleted: number;
  tasksTotal: number;
  completionPercentage: number;
  goalsProgress: number;
  summary: string;
  createdAt: Date;
}
