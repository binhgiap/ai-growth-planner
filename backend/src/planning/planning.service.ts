import { Injectable } from '@nestjs/common';
import { AgentOrchestrationService } from '../ai-agents/services/agent-orchestration.service';
import { UserService } from '../users/users.service';
import { GoalService } from '../goals/goals.service';
import { DailyTaskService } from '../daily-tasks/daily-tasks.service';

/**
 * PlanningService orchestrates the entire workflow from user profile to task generation
 * This is the main service that ties everything together
 */
@Injectable()
export class PlanningService {
  constructor(
    private agentOrchestrationService: AgentOrchestrationService,
    private userService: UserService,
    private goalService: GoalService,
    private dailyTaskService: DailyTaskService,
  ) {}

  /**
   * Generate complete 6-month development plan for a user
   * AND automatically persist it to database
   */
  async generateCompletePlan(userId: string): Promise<unknown> {
    // Get user profile
    const user = await this.userService.findById(userId);

    // Generate development plan through AI agents
    const plan = await this.agentOrchestrationService.generateDevelopmentPlan({
      id: userId,
      currentRole: user.currentRole,
      targetRole: user.targetRole,
      skills: user.skills,
      targetSkills: user.targetSkills,
      hoursPerWeek: user.hoursPerWeek,
    });

    const planObj = plan as Record<string, unknown>;
    const dailyTasksObj = planObj.dailyTasks as Record<string, unknown>;
    const tasksArray = dailyTasksObj.tasks as Array<Record<string, unknown>>;

    // ✅ AUTOMATICALLY PERSIST plan to database
    this.persistPlan(userId, planObj);

    return {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      currentRole: user.currentRole,
      targetRole: user.targetRole,
      skillGapAnalysis: planObj.skillGapAnalysis,
      okrs: planObj.okrs,
      taskCount: tasksArray?.length || 0,
      estimatedHours:
        tasksArray?.reduce(
          (sum: number, task) => sum + (task.estimatedHours as number),
          0,
        ) || 0,
      generatedAt: new Date(),
    };
  }

  /**
   * Create goals and tasks in database from generated plan
   * OPTIMIZED: Uses batch insert instead of sequential saves
   */
  async persistPlan(
    userId: string,
    plan: Record<string, unknown>,
  ): Promise<unknown> {
    // ✅ BATCH: Create all goals at once (instead of for loop)
    const okrs = plan.okrs as Array<Record<string, unknown>>;
    const goalsToCreate = okrs.map((okr) => ({
      title: okr.objective as string,
      description: (okr.keyResults as Array<Record<string, unknown>>)
        .map((kr) => kr.result)
        .join('\n'),
      type: 'OBJECTIVE',
      startDate: new Date(),
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    }));
    const createdGoals = await this.goalService.createBulk(
      userId,
      goalsToCreate,
    );

    // ✅ BATCH: Create all tasks at once (instead of for loop)
    let createdTasks: unknown[] = [];
    const dailyTasks = plan.dailyTasks as Record<string, unknown>;
    if (dailyTasks && dailyTasks.tasks) {
      const tasksArray = dailyTasks.tasks as Array<Record<string, unknown>>;
      const tasksToCreate = tasksArray.map((task) => ({
        title: task.title as string,
        description: task.description as string,
        dueDate: new Date(task.dueDate as string),
        estimatedHours: task.estimatedHours as number,
        priority:
          task.priority === 'high' ? 5 : task.priority === 'medium' ? 3 : 1,
      }));
      createdTasks = await this.dailyTaskService.createBulk(
        userId,
        tasksToCreate,
      );
    }

    return {
      goalsCreated: createdGoals.length,
      tasksCreated: createdTasks.length,
      goals: createdGoals,
      tasks: createdTasks,
    };
  }
}
