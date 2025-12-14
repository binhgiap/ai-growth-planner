import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({
    example: 'Master System Design',
    description: 'Goal title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Learn and implement large-scale system design patterns',
    description: 'Detailed description of the goal',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'OBJECTIVE',
    enum: ['OBJECTIVE', 'KEY_RESULT'],
    description:
      'Goal type - OBJECTIVE for top-level goals, KEY_RESULT for measurable outcomes',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: '2024-01-01',
    type: 'string',
    format: 'date-time',
    description: 'Goal start date',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    example: '2024-06-30',
    type: 'string',
    format: 'date-time',
    description: 'Goal target completion date',
  })
  @IsDate()
  targetDate: Date;

  @ApiPropertyOptional({
    example: 1,
    description: 'Priority level (1=highest, 5=lowest)',
  })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    example: 'Focus on distributed systems and microservices',
    description: 'Additional notes or context',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateGoalDto {
  @ApiPropertyOptional({
    example: 'Master System Design and Architecture',
    description: 'Goal title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example:
      'Learn and implement large-scale system design patterns with hands-on projects',
    description: 'Detailed description of the goal',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 65.5,
    description: 'Progress percentage (0-100)',
  })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({
    example: 'IN_PROGRESS',
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
    description: 'Goal status',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Priority level (1=highest, 5=lowest)',
  })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    example: 'Updated notes - focus on specific areas',
    description: 'Additional notes or context',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class GoalResponseDto {
  id: string;
  title: string;
  description: string;
  type: string;
  progress: number;
  status: string;
  startDate: Date;
  targetDate: Date;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
