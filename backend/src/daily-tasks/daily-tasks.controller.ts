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
import { DailyTaskService } from './daily-tasks.service';
import {
  CreateDailyTaskDto,
  UpdateDailyTaskDto,
} from './dto/create-daily-task.dto';
import { JwtAuthGuard, RolesGuard } from '@auth/guards/auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import type { JwtPayload } from '@auth/strategies/jwt.strategy';
import { UserRole } from '@/users/entities/user.entity';
import { Roles } from '@auth/decorators/roles.decorator';

/**
 * DailyTaskController handles HTTP requests for daily task management
 * Base path: /daily-tasks
 */
@ApiTags('daily-tasks')
@Controller('daily-tasks')
export class DailyTaskController {
  constructor(private readonly dailyTaskService: DailyTaskService) {}

  /**
   * POST /daily-tasks - Create a new task
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new daily task' })
  @ApiBody({ type: CreateDailyTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          title: 'Complete system design document',
          status: 'NOT_STARTED',
          completed: false,
        },
        message: 'Task created successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createDailyTaskDto: CreateDailyTaskDto,
  ) {
    const task = await this.dailyTaskService.create(
      user.id,
      createDailyTaskDto,
    );
    return {
      success: true,
      data: task,
      message: 'Task created successfully',
    };
  }

  /**
   * GET /daily-tasks/today - Get today's tasks
   */
  @Get('today')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tasks for today' })
  @ApiResponse({
    status: 200,
    description: 'Today tasks retrieved successfully',
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
  async getTodaysTasks(@CurrentUser() user: JwtPayload) {
    const tasks = await this.dailyTaskService.getTodaysTasks(user.id);
    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * GET /daily-tasks/range - Get tasks by date range
   */
  @Get('range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tasks within a date range' })
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
    description: 'Tasks retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTasksByDateRange(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tasks = await this.dailyTaskService.getTasksByDateRange(
      user.id,
      new Date(startDate),
      new Date(endDate),
    );
    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * GET /daily-tasks/goal/:goalId - Get tasks by goal
   */
  @Get('goal/:goalId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tasks for a specific goal' })
  @ApiParam({ name: 'goalId', type: 'string', description: 'Goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTasksByGoal(
    @Param('goalId') goalId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const tasks = await this.dailyTaskService.getTasksByGoal(goalId, user.id);
    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * GET /daily-tasks/stats - Get task completion stats
   */
  @Get('stats/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get task completion statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getStats(@CurrentUser() user: JwtPayload) {
    const stats = await this.dailyTaskService.getCompletionStats(user.id);
    return {
      success: true,
      data: stats as unknown,
    };
  }

  /**
   * GET /daily-tasks - Get all tasks for a user
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tasks for a user' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUser(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    const tasks = await this.dailyTaskService.findByUserId(user.id, status);
    return {
      success: true,
      data: tasks as unknown,
      count: tasks.length,
    };
  }

  /**
   * GET /daily-tasks - Get all tasks for a user admin
   */
  @Get('/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tasks for a user admin' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUserAdmin(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const tasks = await this.dailyTaskService.findByUserId(userId!, status);
    return {
      success: true,
      data: tasks as unknown,
      count: tasks.length,
    };
  }

  /**
   * GET /daily-tasks/:id - Get task by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const task = await this.dailyTaskService.findById(id, user.id);
    return {
      success: true,
      data: task as unknown,
    };
  }

  /**
   * PATCH /daily-tasks/:id - Update task
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiBody({ type: UpdateDailyTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateDailyTaskDto: UpdateDailyTaskDto,
  ) {
    const task = await this.dailyTaskService.update(
      id,
      user.id,
      updateDailyTaskDto,
    );
    return {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };
  }

  /**
   * POST /daily-tasks/:id/complete - Mark task as completed
   */
  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a task as completed' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task marked as completed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async completeTask(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const task = await this.dailyTaskService.completeTask(id, user.id);
    return {
      success: true,
      data: task,
      message: 'Task marked as completed',
    };
  }

  /**
   * DELETE /daily-tasks/:id - Delete task
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiResponse({
    status: 204,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.dailyTaskService.delete(id, user.id);
    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }
}
