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
import { ProgressTrackingService } from './progress-tracking.service';
import { CreateProgressLogDto } from './dto/create-progress-log.dto';
import { JwtAuthGuard } from '@auth/guards/auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import type { JwtPayload } from '@auth/strategies/jwt.strategy';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new progress log' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createProgressLogDto: CreateProgressLogDto,
  ) {
    const log = await this.progressTrackingService.create(
      user.id,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all progress logs for a user' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUser(@CurrentUser() user: JwtPayload) {
    const logs = await this.progressTrackingService.findByUserId(user.id);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get logs for a specific period (DAILY, WEEKLY, MONTHLY)',
  })
  @ApiParam({ name: 'period', type: 'string', description: 'Period type' })
  @ApiResponse({
    status: 200,
    description: 'Progress logs retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByPeriod(
    @Param('period') period: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const logs = await this.progressTrackingService.findByPeriod(
      user.id,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get progress logs within a date range' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByDateRange(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const logs = await this.progressTrackingService.findByDateRange(
      user.id,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest progress summary' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getLatestSummary(@CurrentUser() user: JwtPayload) {
    const summary = await this.progressTrackingService.getLatestSummary(
      user.id,
    );
    return {
      success: true,
      data: summary as unknown,
    };
  }

  /**
   * GET /progress-tracking/trends - Get progress trends
   */
  @Get('trends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get progress trends over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({
    status: 200,
    description: 'Progress trends retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTrends(@CurrentUser() user: JwtPayload, @Query('days') days = 30) {
    const trends = await this.progressTrackingService.getProgressTrends(
      user.id,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific progress log by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Progress log ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress log retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Progress log not found',
  })
  async findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const log = await this.progressTrackingService.findById(id, user.id);
    return {
      success: true,
      data: log as unknown,
    };
  }

  /**
   * PATCH /progress-tracking/:id - Update progress log
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a progress log' })
  @ApiParam({ name: 'id', type: 'string', description: 'Progress log ID' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateData: Record<string, unknown>,
  ) {
    const log = await this.progressTrackingService.update(
      id,
      user.id,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a progress log' })
  @ApiParam({ name: 'id', type: 'string', description: 'Progress log ID' })
  @ApiResponse({
    status: 204,
    description: 'Progress log deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.progressTrackingService.delete(id, user.id);
    return {
      success: true,
      message: 'Progress log deleted successfully',
    };
  }
}
