import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AgentOrchestrationService } from '../ai-agents/services/agent-orchestration.service';
import { UserService } from '../users/users.service';
import { GoalService } from '../goals/goals.service';
import { DailyTaskService } from '../daily-tasks/daily-tasks.service';
import { SkillGapService } from '../skill-gap/skill-gap.service';

/**
 * PlanningService handles three-step planning workflow:
 * 1. Analyze skill gaps
 * 2. Generate OKRs based on skill gaps
 * 3. Generate 180 daily tasks based on OKRs
 */
@Injectable()
export class PlanningService {
  private logger = new Logger(PlanningService.name);

  constructor(
    private agentOrchestrationService: AgentOrchestrationService,
    private userService: UserService,
    private goalService: GoalService,
    private dailyTaskService: DailyTaskService,
    private skillGapService: SkillGapService,
  ) {}

  /**
   * Step 1: Analyze skill gaps and save to database
   */
  async analyzeAndSaveSkillGap(
    userId: string,
  ): Promise<Record<string, unknown>> {
    try {
      this.logger.log(`Analyzing skill gaps for user ${userId}`);

      // Check if user can create a new plan
      await this.validateCanCreatePlan(userId);

      // Get user profile
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      // Call SkillGapAgent through orchestration service
      const skillGapAnalysis =
        await this.agentOrchestrationService.analyzeSkillGaps({
          id: userId,
          currentRole: user.currentRole,
          targetRole: user.targetRole,
          skills: user.skills || [],
          targetSkills: user.targetSkills || [],
          hoursPerWeek: user.hoursPerWeek || 10,
        });

      // Save skill gap analysis to database
      const savedSkillGap = await this.skillGapService.create(userId, {
        currentLevel: user.currentRole,
        targetLevel: user.targetRole,
        currentSkills: skillGapAnalysis.currentSkills,
        targetSkills: skillGapAnalysis.targetSkills,
        gaps: skillGapAnalysis.gaps,
        prioritizedGaps: skillGapAnalysis.prioritizedGaps,
        summary: skillGapAnalysis.summary,
      });

      this.logger.log(
        `Skill gap analysis completed and saved for user ${userId}`,
      );

      return {
        id: savedSkillGap.id,
        userId: savedSkillGap.userId,
        currentLevel: savedSkillGap.currentLevel,
        targetLevel: savedSkillGap.targetLevel,
        gaps: savedSkillGap.gaps,
        gapCount: savedSkillGap.totalGapCount,
        priority: 'HIGH',
        createdAt: savedSkillGap.createdAt,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error analyzing skill gaps: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Step 2: Generate OKRs based on skill gaps and save to database
   */
  async generateAndSaveOKRs(userId: string): Promise<Record<string, unknown>> {
    try {
      this.logger.log(`Generating OKRs for user ${userId}`);

      // Get user profile
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      // Get latest skill gap analysis from database
      const skillGapRecord =
        await this.skillGapService.findLatestByUserId(userId);
      if (!skillGapRecord) {
        throw new BadRequestException(
          'No skill gap analysis found. Please run skill gap analysis first.',
        );
      }

      // Generate OKRs from gaps
      const okrs = await this.agentOrchestrationService.generateOKRsFromGaps(
        skillGapRecord.gaps,
      );

      // Save OKRs as goals to database
      const createdGoals: unknown[] = [];
      for (const okr of okrs) {
        const goal = await this.goalService.create(userId, {
          title: okr.objective,
          description: okr.keyResults.map((kr) => kr.result).join('\n'),
          type: 'OBJECTIVE',
          startDate: new Date(),
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        });
        createdGoals.push(goal);
      }

      this.logger.log(`Created ${createdGoals.length} OKRs for user ${userId}`);

      return {
        userId,
        goalsCreated: createdGoals.length,
        okrs: createdGoals,
        createdAt: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating OKRs: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Step 3: Generate 180 daily tasks based on OKRs and save to database
   */
  async generateAndSaveDailyTasks(
    userId: string,
  ): Promise<Record<string, unknown>> {
    try {
      this.logger.log(`Generating daily tasks for user ${userId}`);

      // Get user profile
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      // Get existing goals for this user
      const existingGoals = await this.goalService.findByUserId(userId);
      if (!existingGoals || existingGoals.length === 0) {
        throw new BadRequestException(
          'No OKRs found for this user. Please generate OKRs first.',
        );
      }

      // Get latest skill gap analysis from database
      const skillGapRecord =
        await this.skillGapService.findLatestByUserId(userId);
      if (!skillGapRecord) {
        throw new BadRequestException(
          'No skill gap analysis found. Please run skill gap analysis first.',
        );
      }

      // Generate OKRs from gaps
      const okrs = await this.agentOrchestrationService.generateOKRsFromGaps(
        skillGapRecord.gaps,
      );

      // Generate daily tasks from OKRs
      const dailyTasksOutput =
        await this.agentOrchestrationService.generateDailyTasksFromOKRs(okrs);

      // Save daily tasks to database
      const createdTasks: unknown[] = [];
      const tasksArray = dailyTasksOutput.tasks;

      if (tasksArray && tasksArray.length > 0) {
        let highPriority = 0;
        let mediumPriority = 0;
        let lowPriority = 0;
        let totalEstimatedHours = 0;

        for (const task of tasksArray) {
          // Validate and fix dueDate
          let taskDueDate: Date;
          try {
            // Check if task.dueDate is valid
            if (!task.dueDate || task.dueDate.includes('NaN')) {
              // Generate a fallback date if invalid
              const fallbackDate = new Date();
              fallbackDate.setDate(
                fallbackDate.getDate() + Math.floor(Math.random() * 180),
              );
              taskDueDate = fallbackDate;
              this.logger.warn(
                `Invalid dueDate for task "${task.title}", using fallback: ${taskDueDate.toISOString().split('T')[0]}`,
              );
            } else {
              taskDueDate = new Date(task.dueDate);
              // Check if the parsed date is valid
              if (isNaN(taskDueDate.getTime())) {
                const fallbackDate = new Date();
                fallbackDate.setDate(
                  fallbackDate.getDate() + Math.floor(Math.random() * 180),
                );
                taskDueDate = fallbackDate;
                this.logger.warn(
                  `Invalid parsed dueDate for task "${task.title}", using fallback: ${taskDueDate.toISOString().split('T')[0]}`,
                );
              }
            }
          } catch (error) {
            // Fallback to a random date within 6 months
            const fallbackDate = new Date();
            fallbackDate.setDate(
              fallbackDate.getDate() + Math.floor(Math.random() * 180),
            );
            taskDueDate = fallbackDate;
            this.logger.warn(
              `Error parsing dueDate for task "${task.title}": ${error.message}, using fallback: ${taskDueDate.toISOString().split('T')[0]}`,
            );
          }

          const priority =
            task.priority === 'high' ? 5 : task.priority === 'medium' ? 3 : 1;

          const createdTask = await this.dailyTaskService.create(userId, {
            title: task.title,
            description: task.description,
            dueDate: taskDueDate,
            estimatedHours: task.estimatedHours,
            priority,
          });

          createdTasks.push(createdTask);

          // Track priority counts
          if (priority === 5) highPriority++;
          else if (priority === 3) mediumPriority++;
          else lowPriority++;

          totalEstimatedHours += task.estimatedHours || 0;
        }

        this.logger.log(
          `Created ${createdTasks.length} daily tasks for user ${userId}`,
        );

        return {
          userId,
          tasksCreated: createdTasks.length,
          taskSummary: {
            highPriority,
            mediumPriority,
            lowPriority,
            totalEstimatedHours,
          },
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 180)),
          createdAt: new Date(),
        };
      }

      return {
        userId,
        tasksCreated: 0,
        taskSummary: {
          highPriority: 0,
          mediumPriority: 0,
          lowPriority: 0,
          totalEstimatedHours: 0,
        },
        createdAt: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating daily tasks: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Validate if user can create a new plan
   * User can only create a plan if:
   * 1. No plan exists yet, OR
   * 2. Previous plan has expired (targetDate is in the past)
   */
  private async validateCanCreatePlan(userId: string): Promise<void> {
    // Check if user has an active plan
    const hasActivePlan = await this.goalService.hasActivePlan(userId);
    
    if (hasActivePlan) {
      // Get the latest plan to provide more information
      const latestPlan = await this.goalService.getLatestPlan(userId);
      const expiryDate = latestPlan?.targetDate 
        ? new Date(latestPlan.targetDate).toLocaleDateString('vi-VN')
        : 'unknown';
      
      throw new BadRequestException(
        `Bạn đã có một kế hoạch đang hoạt động. Kế hoạch hiện tại sẽ kết thúc vào ${expiryDate}. Bạn chỉ có thể tạo kế hoạch mới sau khi kế hoạch hiện tại hết hạn.`
      );
    }

    this.logger.log(`User ${userId} is eligible to create a new plan`);
  }

  /**
   * Cancel current active plan
   * Soft deletes all active goals and daily tasks for the user
   */
  async cancelCurrentPlan(userId: string): Promise<Record<string, unknown>> {
    try {
      this.logger.log(`Cancelling current plan for user ${userId}`);

      // Check if user has an active plan
      const hasActivePlan = await this.goalService.hasActivePlan(userId);
      
      if (!hasActivePlan) {
        throw new BadRequestException(
          'Không tìm thấy kế hoạch đang hoạt động để hủy.'
        );
      }

      // Get plan info before deletion
      const latestPlan = await this.goalService.getLatestPlan(userId);
      
      // Delete all active goals
      const deletedGoalsCount = await this.goalService.deleteAllActiveGoals(userId);
      
      // Delete all active daily tasks
      const deletedTasksCount = await this.dailyTaskService.deleteAllActiveTasks(userId);

      this.logger.log(
        `Successfully cancelled plan for user ${userId}: ${deletedGoalsCount} goals and ${deletedTasksCount} tasks deleted`,
      );

      return {
        userId,
        deletedGoals: deletedGoalsCount,
        deletedTasks: deletedTasksCount,
        previousPlanEndDate: latestPlan?.targetDate,
        cancelledAt: new Date(),
        message: 'Kế hoạch đã được hủy thành công. Bạn có thể tạo kế hoạch mới.',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error cancelling plan: ${errorMessage}`);
      throw error;
    }
  }
}
