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
import { GoalService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '@auth/guards/auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import type { JwtPayload } from '@auth/strategies/jwt.strategy';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new goal (OKR)' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    const goal = await this.goalService.create(user.id, createGoalDto);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all goals for a user' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUser(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    const goals = await this.goalService.findByUserId(user.id, status);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get goals by type (OBJECTIVE or KEY_RESULT)' })
  @ApiParam({ name: 'type', type: 'string', description: 'Goal type' })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByType(
    @CurrentUser() user: JwtPayload,
    @Param('type') type: string,
  ) {
    const goals = await this.goalService.findByType(user.id, type);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get overall goal progress summary' })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProgress(@CurrentUser() user: JwtPayload) {
    const progress = await this.goalService.getOverallProgress(user.id);
    return {
      success: true,
      data: { overallProgress: progress },
    };
  }

  /**
   * GET /goals/:id - Get goal by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Goal retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  async findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const goal = await this.goalService.findById(id, user.id);
    return {
      success: true,
      data: goal,
    };
  }

  /**
   * PATCH /goals/:id - Update goal
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update goal' })
  @ApiParam({ name: 'id', type: 'string', description: 'Goal ID' })
  @ApiBody({ type: UpdateGoalDto })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    const goal = await this.goalService.update(id, user.id, updateGoalDto);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete goal' })
  @ApiParam({ name: 'id', type: 'string', description: 'Goal ID' })
  @ApiResponse({
    status: 204,
    description: 'Goal deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.goalService.delete(id, user.id);
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
