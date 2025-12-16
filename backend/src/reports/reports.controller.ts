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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '@auth/guards/auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import type { JwtPayload } from '@auth/strategies/jwt.strategy';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new HR report' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createReportDto: CreateReportDto,
  ) {
    const report = await this.reportService.create(user.id, createReportDto);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reports for a user' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUser(@CurrentUser() user: JwtPayload) {
    const reports = await this.reportService.findByUserId(user.id);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reports by type (MONTHLY, QUARTERLY, FINAL)' })
  @ApiParam({ name: 'type', type: 'string', description: 'Report type' })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByType(
    @Param('type') type: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const reports = await this.reportService.findByType(user.id, type);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get final 6-month HR report' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getFinalReport(@CurrentUser() user: JwtPayload) {
    const report = await this.reportService.getFinalReport(user.id);
    return {
      success: true,
      data: report,
    };
  }

  /**
   * GET /reports/summary/latest - Get latest report
   */
  @Get('summary/latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest report' })
  @ApiResponse({
    status: 200,
    description: 'Latest report retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getLatestReport(@CurrentUser() user: JwtPayload) {
    const report = await this.reportService.getLatestReport(user.id);
    return {
      success: true,
      data: report,
    };
  }

  /**
   * GET /reports/range - Get reports by date range
   */
  @Get('range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reports within a date range' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByDateRange(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const reports = await this.reportService.findByDateRange(
      user.id,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific report by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Report ID' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const report = await this.reportService.findById(id, user.id);
    return {
      success: true,
      data: report,
    };
  }

  /**
   * PATCH /reports/:id - Update report
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a report' })
  @ApiParam({ name: 'id', type: 'string', description: 'Report ID' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateData: Record<string, unknown>,
  ) {
    const report = await this.reportService.update(id, user.id, updateData);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', type: 'string', description: 'Report ID' })
  @ApiResponse({
    status: 204,
    description: 'Report deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.reportService.delete(id, user.id);
    return {
      success: true,
      message: 'Report deleted successfully',
    };
  }
}
