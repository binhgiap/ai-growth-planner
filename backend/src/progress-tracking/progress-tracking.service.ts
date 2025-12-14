import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { ProgressLog } from './entities/progress-log.entity';
import {
  CreateProgressLogDto,
  ProgressLogResponseDto,
} from './dto/create-progress-log.dto';

/**
 * ProgressTrackingService handles progress logging and analytics
 */
@Injectable()
export class ProgressTrackingService {
  constructor(
    @InjectRepository(ProgressLog)
    private progressLogsRepository: Repository<ProgressLog>,
  ) {}

  /**
   * Create a new progress log
   */
  async create(
    userId: string,
    createProgressLogDto: CreateProgressLogDto,
  ): Promise<ProgressLogResponseDto> {
    const progressLog = this.progressLogsRepository.create({
      ...createProgressLogDto,
      user_id: userId,
      completionPercentage: 0,
      goalsProgress: 0,
      skillsImproved: 0,
    });

    const savedLog = await this.progressLogsRepository.save(progressLog);
    return this.mapToDto(savedLog);
  }

  /**
   * Get all progress logs for a user
   */
  async findByUserId(userId: string): Promise<ProgressLogResponseDto[]> {
    const logs = await this.progressLogsRepository.find({
      where: { user_id: userId, deletedAt: IsNull() },
      order: { periodEndDate: 'DESC' },
    });

    return logs.map((log) => this.mapToDto(log));
  }

  /**
   * Get progress log by period
   */
  async findByPeriod(
    userId: string,
    period: string,
  ): Promise<ProgressLogResponseDto[]> {
    const logs = await this.progressLogsRepository.find({
      where: { user_id: userId, period, deletedAt: IsNull() },
      order: { periodEndDate: 'DESC' },
    });

    return logs.map((log) => this.mapToDto(log));
  }

  /**
   * Get progress logs for a date range
   */
  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProgressLogResponseDto[]> {
    const logs = await this.progressLogsRepository.find({
      where: {
        user_id: userId,
        periodEndDate: Between(startDate, endDate),
        deletedAt: IsNull(),
      },
      order: { periodEndDate: 'ASC' },
    });

    return logs.map((log) => this.mapToDto(log));
  }

  /**
   * Get progress log by ID
   */
  async findById(id: string, userId: string): Promise<ProgressLogResponseDto> {
    const log = await this.progressLogsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!log) {
      throw new NotFoundException(`Progress log with ID ${id} not found`);
    }

    return this.mapToDto(log);
  }

  /**
   * Update progress log
   */
  async update(
    id: string,
    userId: string,
    updateData: Partial<ProgressLog>,
  ): Promise<ProgressLogResponseDto> {
    const log = await this.progressLogsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!log) {
      throw new NotFoundException(`Progress log with ID ${id} not found`);
    }

    Object.assign(log, updateData);
    const updatedLog = await this.progressLogsRepository.save(log);
    return this.mapToDto(updatedLog);
  }

  /**
   * Delete progress log (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const log = await this.progressLogsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!log) {
      throw new NotFoundException(`Progress log with ID ${id} not found`);
    }

    log.deletedAt = new Date();
    await this.progressLogsRepository.save(log);
  }

  /**
   * Get latest progress summary
   */
  async getLatestSummary(userId: string): Promise<any> {
    const latestLog = await this.progressLogsRepository.findOne({
      where: { user_id: userId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!latestLog) {
      return {
        completionPercentage: 0,
        goalsProgress: 0,
        tasksCompleted: 0,
        tasksTotal: 0,
      };
    }

    return {
      completionPercentage: latestLog.completionPercentage,
      goalsProgress: latestLog.goalsProgress,
      tasksCompleted: latestLog.tasksCompleted,
      tasksTotal: latestLog.tasksTotal,
      skillsImproved: latestLog.skillsImproved,
      summary: latestLog.summary,
      periodEndDate: latestLog.periodEndDate,
    };
  }

  /**
   * Get progress trends (for charting)
   */
  async getProgressTrends(userId: string, days = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.progressLogsRepository.find({
      where: {
        user_id: userId,
        periodEndDate: Between(startDate, new Date()),
        deletedAt: IsNull(),
      },
      order: { periodEndDate: 'ASC' },
    });

    return logs.map((log) => ({
      date: log.periodEndDate,
      completion: log.completionPercentage,
      goals: log.goalsProgress,
      tasks: log.tasksCompleted,
    }));
  }

  /**
   * Map ProgressLog entity to DTO
   */
  private mapToDto(log: ProgressLog): ProgressLogResponseDto {
    return {
      id: log.id,
      period: log.period,
      periodStartDate: log.periodStartDate,
      periodEndDate: log.periodEndDate,
      tasksCompleted: log.tasksCompleted,
      tasksTotal: log.tasksTotal,
      completionPercentage: log.completionPercentage,
      goalsProgress: log.goalsProgress,
      summary: log.summary,
      createdAt: log.createdAt,
    };
  }
}
