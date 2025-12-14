import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDailyTaskDto {
  @ApiProperty({
    example: 'Read system design chapter 3',
    description: 'Task title',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Focus on distributed transactions and consistency models',
    description: 'Detailed task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2024-01-15',
    type: 'string',
    format: 'date-time',
    description: 'Task due date',
  })
  @IsDate()
  dueDate: Date;

  @ApiPropertyOptional({
    example: 1,
    description: 'Priority level (1=highest, 5=lowest)',
  })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Estimated hours to complete task',
  })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({
    example: 'goal-uuid-123',
    description: 'Associated goal ID',
  })
  @IsString()
  @IsOptional()
  goalId?: string;

  @ApiPropertyOptional({
    example: 'Use Notion for note-taking',
    description: 'Additional notes or instructions',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateDailyTaskDto {
  @ApiPropertyOptional({
    example: 'Read and summarize system design chapter 3',
    description: 'Task title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description with more focus',
    description: 'Detailed task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'COMPLETED',
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
    description: 'Task status',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: 85,
    description: 'Task completion percentage (0-100)',
  })
  @IsNumber()
  @IsOptional()
  completionPercentage?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Priority level (1=highest, 5=lowest)',
  })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    example: 2.75,
    description: 'Actual hours spent on task',
  })
  @IsNumber()
  @IsOptional()
  actualHours?: number;

  @ApiPropertyOptional({
    example: 'Completed with additional research',
    description: 'Additional notes or feedback',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class DailyTaskResponseDto {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: string;
  completionPercentage: number;
  priority: number;
  estimatedHours: number;
  actualHours: number;
  createdAt: Date;
  updatedAt: Date;
}
