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
import { DailyTaskService } from './daily-tasks.service';
import {
  CreateDailyTaskDto,
  UpdateDailyTaskDto,
} from './dto/create-daily-task.dto';

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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new daily task' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
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
  async create(
    @Query('userId') userId: string,
    @Body() createDailyTaskDto: CreateDailyTaskDto,
  ) {
    const task = await this.dailyTaskService.create(userId, createDailyTaskDto);
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
  @ApiOperation({ summary: 'Get all tasks for today' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
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
  async getTodaysTasks(@Query('userId') userId: string) {
    const tasks = await this.dailyTaskService.getTodaysTasks(userId);
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
  @ApiOperation({ summary: 'Get tasks within a date range' })
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
    description: 'Tasks retrieved successfully',
  })
  async getTasksByDateRange(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tasks = await this.dailyTaskService.getTasksByDateRange(
      userId,
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
  @ApiOperation({ summary: 'Get all tasks for a specific goal' })
  @ApiParam({ name: 'goalId', type: 'string', description: 'Goal ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  async getTasksByGoal(
    @Param('goalId') goalId: string,
    @Query('userId') userId: string,
  ) {
    const tasks = await this.dailyTaskService.getTasksByGoal(goalId, userId);
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
  @ApiOperation({ summary: 'Get task completion statistics' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@Query('userId') userId: string) {
    const stats = await this.dailyTaskService.getCompletionStats(userId);
    return {
      success: true,
      data: stats as unknown,
    };
  }

  /**
   * GET /daily-tasks - Get all tasks for a user
   */
  @Get()
  @ApiOperation({ summary: 'Get all tasks for a user' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
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
  async findByUser(
    @Query('userId') userId: string,
    @Query('status') status?: string,
  ) {
    const tasks = await this.dailyTaskService.findByUserId(userId, status);
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
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async findById(@Param('id') id: string, @Query('userId') userId: string) {
    const task = await this.dailyTaskService.findById(id, userId);
    return {
      success: true,
      data: task as unknown,
    };
  }

  /**
   * PATCH /daily-tasks/:id - Update task
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({ type: UpdateDailyTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateDailyTaskDto: UpdateDailyTaskDto,
  ) {
    const task = await this.dailyTaskService.update(
      id,
      userId,
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
  @ApiOperation({ summary: 'Mark a task as completed' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Task marked as completed',
  })
  async completeTask(@Param('id') id: string, @Query('userId') userId: string) {
    const task = await this.dailyTaskService.completeTask(id, userId);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'Task deleted successfully',
  })
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    await this.dailyTaskService.delete(id, userId);
    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }
}
