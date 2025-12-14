import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ReportService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

/**
 * ReportController handles HTTP requests for report management
 * Base path: /reports
 */
@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * POST /reports - Create a new report
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new HR report' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          type: 'MONTHLY',
          period: 'January 2024',
          completionRate: 85.5,
        },
        message: 'Report created successfully',
      },
    },
  })
  async create(
    @Query('userId') userId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    const report = await this.reportService.create(userId, createReportDto);
    return {
      success: true,
      data: report,
      message: 'Report created successfully',
    };
  }

  /**
   * GET /reports - Get all reports for a user
   */
  @Get()
  @ApiOperation({ summary: 'Get all reports for a user' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [],
        count: 0,
      },
    },
  })
  async findByUser(@Query('userId') userId: string) {
    const reports = await this.reportService.findByUserId(userId);
    return {
      success: true,
      data: reports,
      count: reports.length,
    };
  }

  /**
   * GET /reports/type/:type - Get reports by type
   */
  @Get('type/:type')
  @ApiOperation({ summary: 'Get reports by type (MONTHLY, QUARTERLY, FINAL)' })
  @ApiParam({ name: 'type', type: 'string', description: 'Report type' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
  })
  async findByType(
    @Param('type') type: string,
    @Query('userId') userId: string,
  ) {
    const reports = await this.reportService.findByType(userId, type);
    return {
      success: true,
      data: reports,
      count: reports.length,
    };
  }

  /**
   * GET /reports/summary/final - Get final report
   */
  @Get('summary/final')
  @ApiOperation({ summary: 'Get final 6-month HR report' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Final report retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          overallProgress: 87.3,
          strengths: ['Leadership', 'Communication'],
          areasForImprovement: ['Technical depth'],
          recommendations: ['Continue current trajectory'],
        },
      },
    },
  })
  async getFinalReport(@Query('userId') userId: string) {
    const report = await this.reportService.getFinalReport(userId);
    return {
      success: true,
      data: report,
    };
  }

  /**
   * GET /reports/summary/latest - Get latest report
   */
  @Get('summary/latest')
  @ApiOperation({ summary: 'Get latest report' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Latest report retrieved successfully',
  })
  async getLatestReport(@Query('userId') userId: string) {
    const report = await this.reportService.getLatestReport(userId);
    return {
      success: true,
      data: report,
    };
  }

  /**
   * GET /reports/range - Get reports by date range
   */
  @Get('range')
  @ApiOperation({ summary: 'Get reports within a date range' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
  })
  async findByDateRange(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const reports = await this.reportService.findByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
    return {
      success: true,
      data: reports,
      count: reports.length,
    };
  }

  /**
   * GET /reports/:id - Get report by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific report by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Report ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async findById(@Param('id') id: string, @Query('userId') userId: string) {
    const report = await this.reportService.findById(id, userId);
    return {
      success: true,
      data: report,
    };
  }

  /**
   * PATCH /reports/:id - Update report
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiParam({ name: 'id', type: 'string', description: 'Report ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({
    schema: {
      example: {
        status: 'COMPLETED',
        notes: 'Report review completed',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Report updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateData: Record<string, unknown>,
  ) {
    const report = await this.reportService.update(id, userId, updateData);
    return {
      success: true,
      data: report,
      message: 'Report updated successfully',
    };
  }

  /**
   * DELETE /reports/:id - Delete report
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', type: 'string', description: 'Report ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'Report deleted successfully',
  })
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    await this.reportService.delete(id, userId);
    return {
      success: true,
      message: 'Report deleted successfully',
    };
  }
}
