import { Controller, Post, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlanningService } from './planning.service';

/**
 * PlanningController handles the main planning workflow
 * Base path: /planning
 */
@ApiTags('planning')
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  /**
   * POST /planning/generate - Generate complete 6-month plan for a user
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate a complete 6-month development plan',
    description:
      'Orchestrates all AI agents to generate a comprehensive 6-month roadmap including skill gap analysis, goals (OKRs), and daily tasks',
  })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 201,
    description: '6-month development plan generated successfully',
    schema: {
      example: {
        success: true,
        data: {
          skillGap: {
            currentLevel: 'Intermediate',
            targetLevel: 'Advanced',
            gaps: ['System Design', 'Leadership'],
          },
          goals: [
            {
              title: 'Master System Design',
              type: 'OBJECTIVE',
              keyResults: ['Design 3 large-scale systems'],
            },
          ],
          dailyTasks: [
            {
              date: '2024-01-01',
              tasks: [
                {
                  title: 'Read system design case study',
                  duration: 2,
                  priority: 'HIGH',
                },
              ],
            },
          ],
        },
        message: '6-month development plan generated successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User profile incomplete or invalid',
  })
  @ApiResponse({
    status: 500,
    description: 'Error generating plan from AI agents',
  })
  async generatePlan(@Query('userId') userId: string) {
    const plan = await this.planningService.generateCompletePlan(userId);
    return {
      success: true,
      data: plan,
      message: '6-month development plan generated successfully',
    };
  }

  /**
   * POST /planning/persist - Save generated plan to database
   */
  @Post('persist')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Persist/save the generated plan to database',
    description:
      'Saves the generated 6-month plan along with all goals and tasks to the database',
  })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiQuery({
    name: 'plan',
    type: 'object',
    description: 'The generated plan object',
  })
  @ApiResponse({
    status: 201,
    description: 'Plan saved to database successfully',
    schema: {
      example: {
        success: true,
        data: {
          userId: 'uuid',
          goalsCreated: 6,
          tasksCreated: 180,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        message: 'Plan saved to database successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid plan format or user not found',
  })
  async persistPlan(
    @Query('userId') userId: string,
    @Query('plan') plan: Record<string, unknown>,
  ) {
    const result = await this.planningService.persistPlan(userId, plan);
    return {
      success: true,
      data: result,
      message: 'Plan saved to database successfully',
    };
  }
}
