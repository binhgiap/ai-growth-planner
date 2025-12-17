import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlanningService } from './planning.service';
import { JwtAuthGuard } from '@auth/guards/auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import type { JwtPayload } from '@auth/strategies/jwt.strategy';

/**
 * PlanningController handles the three-step planning workflow
 * Base path: /planning
 */
@ApiTags('planning')
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  /**
   * POST /planning/skill-gap - Analyze skill gaps and save to database
   */
  @Post('skill-gap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Analyze skill gaps for user',
    description:
      'Analyzes the gap between current and target skills using SkillGapAgent and saves the analysis to the database',
  })
  @ApiResponse({
    status: 201,
    description: 'Skill gap analysis completed and saved',
    schema: {
      example: {
        success: true,
        data: {
          userId: 'uuid',
          currentLevel: 'Intermediate',
          targetLevel: 'Advanced',
          gaps: ['System Design', 'Leadership'],
          gapCount: 2,
          priority: 'HIGH',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        message: 'Skill gap analysis completed and saved successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User profile incomplete or invalid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Error analyzing skill gaps',
  })
  async analyzeSkillGap(@CurrentUser() user: JwtPayload) {
    const result = await this.planningService.analyzeAndSaveSkillGap(user.id);
    return {
      success: true,
      data: result,
      message: 'Skill gap analysis completed and saved successfully',
    };
  }

  /**
   * POST /planning/goal-planning - Generate OKRs and save to database
   */
  @Post('goal-planning')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate OKRs for 6-month planning',
    description:
      'Generates 6-month OKRs based on skill gaps using GoalPlannerAgent and saves them to the database',
  })
  @ApiResponse({
    status: 201,
    description: 'OKRs generated and saved successfully',
    schema: {
      example: {
        success: true,
        data: {
          userId: 'uuid',
          goalsCreated: 6,
          okrs: [
            {
              id: 'uuid',
              objective: 'Master System Design',
              keyResults: ['Design 3 large-scale systems'],
              timeline: '6 months',
            },
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        message: 'OKRs generated and saved successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Skill gap analysis not found or invalid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Error generating OKRs',
  })
  async generateGoalPlanning(@CurrentUser() user: JwtPayload) {
    const result = await this.planningService.generateAndSaveOKRs(user.id);
    return {
      success: true,
      data: result,
      message: 'OKRs generated and saved successfully',
    };
  }

  /**
   * POST /planning/daily-task - Generate 180 daily tasks and save to database
   */
  @Post('daily-task')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate 180 daily tasks for 6-month plan',
    description:
      'Generates 180 daily tasks based on OKRs using DailyTaskAgent and saves them to the database',
  })
  @ApiResponse({
    status: 201,
    description: 'Daily tasks generated and saved successfully',
    schema: {
      example: {
        success: true,
        data: {
          userId: 'uuid',
          tasksCreated: 180,
          taskSummary: {
            highPriority: 45,
            mediumPriority: 90,
            lowPriority: 45,
            totalEstimatedHours: 540,
          },
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        message: 'Daily tasks generated and saved successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'OKRs not found or invalid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Error generating daily tasks',
  })
  async generateDailyTasks(@CurrentUser() user: JwtPayload) {
    const result = await this.planningService.generateAndSaveDailyTasks(
      user.id,
    );
    return {
      success: true,
      data: result,
      message: 'Daily tasks generated and saved successfully',
    };
  }

  /**
   * POST /planning/cancel - Cancel current active plan
   */
  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel current active plan',
    description:
      'Cancels the current active plan by soft deleting all active goals and daily tasks. After cancellation, user can create a new plan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan cancelled successfully',
    schema: {
      example: {
        success: true,
        data: {
          userId: 'uuid',
          deletedGoals: 6,
          deletedTasks: 180,
          previousPlanEndDate: '2026-06-17T00:00:00.000Z',
          cancelledAt: '2024-01-01T00:00:00.000Z',
          message: 'Kế hoạch đã được hủy thành công. Bạn có thể tạo kế hoạch mới.',
        },
        message: 'Plan cancelled successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No active plan found to cancel',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Error cancelling plan',
  })
  async cancelPlan(@CurrentUser() user: JwtPayload) {
    const result = await this.planningService.cancelCurrentPlan(user.id);
    return {
      success: true,
      data: result,
      message: 'Plan cancelled successfully',
    };
  }
}
