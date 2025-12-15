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
import { GoalService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/create-goal.dto';

/**
 * GoalController handles HTTP requests for goal management
 * Base path: /goals
 */
@ApiTags('goals')
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  /**
   * POST /goals - Create a new goal
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new goal (OKR)' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({ type: CreateGoalDto })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          title: 'Improve System Performance',
          type: 'OBJECTIVE',
          progress: 0,
          status: 'IN_PROGRESS',
        },
        message: 'Goal created successfully',
      },
    },
  })
  async create(
    @Query('userId') userId: string,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    const goal = await this.goalService.create(userId, createGoalDto);
    return {
      success: true,
      data: goal,
      message: 'Goal created successfully',
    };
  }

  /**
   * GET /goals - Get all goals for a user
   */
  @Get()
  @ApiOperation({ summary: 'Get all goals for a user' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [],
        count: 0,
      },
    },
  })
  async findByUser(
    @Query('userId') userId: string,
    @Query('status') status?: string,
  ) {
    const goals = await this.goalService.findByUserId(userId, status);
    return {
      success: true,
      data: goals,
      count: goals.length,
    };
  }

  /**
   * GET /goals/type/:type - Get goals by type
   */
  @Get('type/:type')
  @ApiOperation({ summary: 'Get goals by type (OBJECTIVE or KEY_RESULT)' })
  @ApiParam({ name: 'type', type: 'string', description: 'Goal type' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
  })
  async findByType(
    @Query('userId') userId: string,
    @Param('type') type: string,
  ) {
    const goals = await this.goalService.findByType(userId, type);
    return {
      success: true,
      data: goals,
      count: goals.length,
    };
  }

  /**
   * GET /goals/progress - Get overall goal progress
   */
  @Get('progress/summary')
  @ApiOperation({ summary: 'Get overall goal progress summary' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress summary retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          overallProgress: 45.5,
        },
      },
    },
  })
  async getProgress(@Query('userId') userId: string) {
    const progress = await this.goalService.getOverallProgress(userId);
    return {
      success: true,
      data: { overallProgress: progress },
    };
  }

  /**
   * GET /goals/:id - Get goal by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Goal ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Goal retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  async findById(@Param('id') id: string, @Query('userId') userId: string) {
    const goal = await this.goalService.findById(id, userId);
    return {
      success: true,
      data: goal,
    };
  }

  /**
   * PATCH /goals/:id - Update goal
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update goal' })
  @ApiParam({ name: 'id', type: 'string', description: 'Goal ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiBody({ type: UpdateGoalDto })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    const goal = await this.goalService.update(id, userId, updateGoalDto);
    return {
      success: true,
      data: goal,
      message: 'Goal updated successfully',
    };
  }

  /**
   * DELETE /goals/:id - Delete goal
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete goal' })
  @ApiParam({ name: 'id', type: 'string', description: 'Goal ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'Goal deleted successfully',
  })
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    await this.goalService.delete(id, userId);
    return {
      success: true,
      message: 'Goal deleted successfully',
    };
  }

  /**
   * GET /goals/completed/unminted - Get COMPLETED goals that have not been minted as NFT
   *
   * This endpoint is mainly for the NFT cron job to know which goals
   * still need an NFT to be minted for them.
   */
  @Get('completed/unminted')
  @ApiOperation({
    summary:
      'Get COMPLETED goals that have not been minted as NFT (isMintedNft = false)',
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    required: false,
    description: 'Optional user ID to filter by user',
  })
  @ApiResponse({
    status: 200,
    description: 'Completed and unminted goals retrieved successfully',
  })
  async getCompletedUnminted(@Query('userId') userId?: string) {
    const goals = await this.goalService.findCompletedNotMinted(userId);
    return {
      success: true,
      data: goals,
      count: goals.length,
    };
  }
}
