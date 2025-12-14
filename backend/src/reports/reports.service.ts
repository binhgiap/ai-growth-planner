import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto, ReportResponseDto } from './dto/create-report.dto';

/**
 * ReportService handles report generation and retrieval
 * Includes HR summary, strengths, weaknesses, and recommendations
 */
@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  /**
   * Create a new report
   */
  async create(
    userId: string,
    createReportDto: CreateReportDto,
  ): Promise<ReportResponseDto> {
    const report = this.reportsRepository.create({
      ...createReportDto,
      user_id: userId,
      generatedDate: new Date(),
      strengths: [],
      weaknesses: [],
      achievements: [],
      areasForImprovement: [],
    });

    const savedReport = await this.reportsRepository.save(report);
    return this.mapToDto(savedReport);
  }

  /**
   * Get all reports for a user
   */
  async findByUserId(userId: string): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepository.find({
      where: { user_id: userId, deletedAt: IsNull() },
      order: { generatedDate: 'DESC' },
    });

    return reports.map((report) => this.mapToDto(report));
  }

  /**
   * Get report by ID
   */
  async findById(id: string, userId: string): Promise<ReportResponseDto> {
    const report = await this.reportsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return this.mapToDto(report);
  }

  /**
   * Get reports by type
   */
  async findByType(userId: string, type: string): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepository.find({
      where: { user_id: userId, type, deletedAt: IsNull() },
      order: { generatedDate: 'DESC' },
    });

    return reports.map((report) => this.mapToDto(report));
  }

  /**
   * Get final/comprehensive report
   */
  async getFinalReport(userId: string): Promise<ReportResponseDto> {
    const finalReport = await this.reportsRepository.findOne({
      where: { user_id: userId, type: 'FINAL', deletedAt: IsNull() },
      order: { generatedDate: 'DESC' },
    });

    if (!finalReport) {
      throw new NotFoundException(`No final report found for user ${userId}`);
    }

    return this.mapToDto(finalReport);
  }

  /**
   * Get latest report
   */
  async getLatestReport(userId: string): Promise<ReportResponseDto | null> {
    const report = await this.reportsRepository.findOne({
      where: { user_id: userId, deletedAt: IsNull() },
      order: { generatedDate: 'DESC' },
    });

    return report ? this.mapToDto(report) : null;
  }

  /**
   * Update report
   */
  async update(
    id: string,
    userId: string,
    updateData: Partial<Report>,
  ): Promise<ReportResponseDto> {
    const report = await this.reportsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    Object.assign(report, updateData);
    const updatedReport = await this.reportsRepository.save(report);
    return this.mapToDto(updatedReport);
  }

  /**
   * Delete report (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const report = await this.reportsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    report.deletedAt = new Date();
    await this.reportsRepository.save(report);
  }

  /**
   * Get reports within a date range
   */
  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepository.find({
      where: {
        user_id: userId,
        generatedDate: Between(startDate, endDate),
        deletedAt: IsNull(),
      },
      order: { generatedDate: 'ASC' },
    });

    return reports.map((report) => this.mapToDto(report));
  }

  /**
   * Map Report entity to DTO
   */
  private mapToDto(report: Report): ReportResponseDto {
    return {
      id: report.id,
      type: report.type,
      generatedDate: report.generatedDate,
      reportPeriodStart: report.reportPeriodStart,
      reportPeriodEnd: report.reportPeriodEnd,
      overallProgress: report.overallProgress,
      strengths: report.strengths || [],
      weaknesses: report.weaknesses || [],
      achievements: report.achievements || [],
      areasForImprovement: report.areasForImprovement || [],
      executiveSummary: report.executiveSummary,
      recommendations: report.recommendations,
      createdAt: report.createdAt,
    };
  }
}
