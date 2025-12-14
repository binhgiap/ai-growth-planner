import { IsString, IsDate, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    example: 'MONTHLY',
    enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'FINAL'],
    description: 'Report type',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: '2024-01-01',
    type: 'string',
    format: 'date-time',
    description: 'Report period start date',
  })
  @IsDate()
  reportPeriodStart: Date;

  @ApiProperty({
    example: '2024-01-31',
    type: 'string',
    format: 'date-time',
    description: 'Report period end date',
  })
  @IsDate()
  reportPeriodEnd: Date;

  @ApiPropertyOptional({
    example: 'January 2024 Progress Review',
    description: 'Report title',
  })
  @IsString()
  @IsOptional()
  title?: string;
}

export class ReportResponseDto {
  id: string;
  type: string;
  generatedDate: Date;
  reportPeriodStart: Date;
  reportPeriodEnd: Date;
  overallProgress: number;
  strengths: string[];
  weaknesses: string[];
  achievements: string[];
  areasForImprovement: string[];
  executiveSummary: string;
  recommendations: string;
  createdAt: Date;
}
