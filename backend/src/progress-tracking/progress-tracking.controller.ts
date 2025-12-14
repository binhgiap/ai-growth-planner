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
import { ProgressTrackingService } from './progress-tracking.service';
import { CreateProgressLogDto } from './dto/create-progress-log.dto';

/**
 * ProgressTrackingController handles HTTP requests for progress tracking
 * Base path: /progress-tracking
 */
@ApiTags('progress-tracking')
@Controller('progress-tracking')
export class ProgressTrackingController {
  constructor(
    private readonly progressTrackingService: ProgressTrackingService,
  ) {}

  /**
   * POST /progress-tracking - Create a new progress log
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new progress log' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({ type: CreateProgressLogDto })
  @ApiResponse({
    status: 201,
    description: 'Progress log created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          period: 'WEEKLY',
          tasksCompleted: 15,
          goalsOnTrack: 5,
        },
        message: 'Progress log created successfully',
      },
    },
  })
  async create(
    @Query('userId') userId: string,
    @Body() createProgressLogDto: CreateProgressLogDto,
  ) {
    const log = await this.progressTrackingService.create(
      userId,
      createProgressLogDto,
    );
    return {
      success: true,
      data: log,
      message: 'Progress log created successfully',
    };
  }

  /**
   * GET /progress-tracking - Get all progress logs for a user
   */
  @Get()
  @ApiOperation({ summary: 'Get all progress logs for a user' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress logs retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [],
        count: 0,
      },
    },
  })
  async findByUser(@Query('userId') userId: string) {
    const logs = await this.progressTrackingService.findByUserId(userId);
    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  /**
   * GET /progress-tracking/period/:period - Get logs by period
   */
  @Get('period/:period')
  @ApiOperation({
    summary: 'Get logs for a specific period (DAILY, WEEKLY, MONTHLY)',
  })
  @ApiParam({ name: 'period', type: 'string', description: 'Period type' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress logs retrieved successfully',
  })
  async findByPeriod(
    @Param('period') period: string,
    @Query('userId') userId: string,
  ) {
    const logs = await this.progressTrackingService.findByPeriod(
      userId,
      period,
    );
    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  /**
   * GET /progress-tracking/range - Get logs by date range
   */
  @Get('range')
  @ApiOperation({ summary: 'Get progress logs within a date range' })
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
    description: 'Progress logs retrieved successfully',
  })
  async findByDateRange(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const logs = await this.progressTrackingService.findByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  /**
   * GET /progress-tracking/summary/latest - Get latest progress summary
   */
  @Get('summary/latest')
  @ApiOperation({ summary: 'Get latest progress summary' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress summary retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          overallProgress: 65.3,
          completionRate: 72.5,
          onTrack: true,
        },
      },
    },
  })
  async getLatestSummary(@Query('userId') userId: string) {
    const summary = await this.progressTrackingService.getLatestSummary(userId);
    return {
      success: true,
      data: summary as unknown,
    };
  }

  /**
   * GET /progress-tracking/trends - Get progress trends
   */
  @Get('trends')
  @ApiOperation({ summary: 'Get progress trends over time' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({
    status: 200,
    description: 'Progress trends retrieved successfully',
  })
  async getTrends(@Query('userId') userId: string, @Query('days') days = 30) {
    const trends = await this.progressTrackingService.getProgressTrends(
      userId,
      days,
    );
    return {
      success: true,
      data: trends as unknown,
    };
  }

  /**
   * GET /progress-tracking/:id - Get progress log by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific progress log by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Progress log ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress log retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Progress log not found',
  })
  async findById(@Param('id') id: string, @Query('userId') userId: string) {
    const log = await this.progressTrackingService.findById(id, userId);
    return {
      success: true,
      data: log as unknown,
    };
  }

  /**
   * PATCH /progress-tracking/:id - Update progress log
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a progress log' })
  @ApiParam({ name: 'id', type: 'string', description: 'Progress log ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({
    schema: {
      example: {
        tasksCompleted: 20,
        notes: 'Good progress this week',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Progress log updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateData: Record<string, unknown>,
  ) {
    const log = await this.progressTrackingService.update(
      id,
      userId,
      updateData,
    );
    return {
      success: true,
      data: log,
      message: 'Progress log updated successfully',
    };
  }

  /**
   * DELETE /progress-tracking/:id - Delete progress log
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a progress log' })
  @ApiParam({ name: 'id', type: 'string', description: 'Progress log ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'Progress log deleted successfully',
  })
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    await this.progressTrackingService.delete(id, userId);
    return {
      success: true,
      message: 'Progress log deleted successfully',
    };
  }
}
