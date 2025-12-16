import { Injectable, Logger } from '@nestjs/common';
import { SkillGapAgent } from '../agents/skill-gap.agent';
import { GoalPlannerAgent } from '../agents/goal-planner.agent';
import { DailyTaskAgent } from '../agents/daily-task.agent';
import { ProgressTrackerAgent } from '../agents/progress-tracker.agent';
import { HRReportAgent } from '../agents/hr-report.agent';

// Type definitions for agent outputs
interface SkillGapAnalysis {
  currentSkills: string[];
  targetSkills: string[];
  gaps: Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    currentLevel: number;
    targetLevel: number;
  }>;
  prioritizedGaps: string[];
  summary: string;
}

interface OKR {
  objective: string;
  keyResults: Array<{
    result: string;
    milestone: string;
    metrics: string;
  }>;
  timeline: string;
}

interface DailyTasksOutput {
  tasks: Array<{
    title: string;
    description: string;
    dueDate: string;
    estimatedHours: number;
    priority: 'high' | 'medium' | 'low';
    linkedGoal: string;
    resources: string[];
  }>;
  schedule: string;
  summary: string;
}

/**
 * AgentOrchestrationService orchestrates the multi-agent workflow
 * Coordinates the flow: SkillGap → GoalPlanner → DailyTask → ProgressTracker → HRReport
 */
@Injectable()
export class AgentOrchestrationService {
  private logger = new Logger(AgentOrchestrationService.name);

  constructor(
    private skillGapAgent: SkillGapAgent,
    private goalPlannerAgent: GoalPlannerAgent,
    private dailyTaskAgent: DailyTaskAgent,
    private progressTrackerAgent: ProgressTrackerAgent,
    private hrReportAgent: HRReportAgent,
  ) {}

  /**
   * Analyze skill gaps for a user
   * Step 1 of the planning workflow
   */
  async analyzeSkillGaps(userProfile: {
    id: string;
    currentRole: string;
    targetRole: string;
    skills: string[];
    targetSkills: string[];
    hoursPerWeek: number;
    yearsExperience?: number;
  }): Promise<SkillGapAnalysis> {
    try {
      this.logger.log(`Analyzing skill gaps for user ${userProfile.id}`);
      const skillGapAnalysis =
        await this.skillGapAgent.analyzeSkillGaps(userProfile);
      this.logger.log('Skill gap analysis completed');
      return skillGapAnalysis as SkillGapAnalysis;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in skill gap analysis: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Generate OKRs from identified skill gaps
   * Step 2 of the planning workflow
   */
  async generateOKRsFromGaps(
    gaps: Array<{
      skill: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      currentLevel: number;
      targetLevel: number;
    }>,
  ): Promise<OKR[]> {
    try {
      this.logger.log('Generating 6-month OKRs from skill gaps...');
      const okrs = await this.goalPlannerAgent.generateOKRs(gaps);
      this.logger.log('OKRs generated successfully');
      return okrs as OKR[];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in OKR generation: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Generate 180 daily tasks from OKRs
   * Step 3 of the planning workflow
   */
  async generateDailyTasksFromOKRs(okrs: OKR[]): Promise<DailyTasksOutput> {
    try {
      this.logger.log('Generating 180 daily tasks from OKRs...');
      const dailyTasks = await this.dailyTaskAgent.generateDailyTasks(
        okrs.map((okr) => ({
          objective: okr.objective,
          keyResults: okr.keyResults.map((kr) => kr.result),
          timeline: okr.timeline,
        })),
      );
      this.logger.log('Daily tasks generated successfully');
      return dailyTasks as DailyTasksOutput;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in daily task generation: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Orchestrate complete 6-month development plan generation
   * Calls agents in sequence: SkillGap → Goals → Tasks
   * Note: This method calls all 3 steps. For independent step control, use the individual methods above.
   */
  async generateDevelopmentPlan(userProfile: {
    id: string;
    currentRole: string;
    targetRole: string;
    skills: string[];
    targetSkills: string[];
    hoursPerWeek: number;
    yearsExperience?: number;
  }): Promise<{
    skillGapAnalysis: SkillGapAnalysis;
    okrs: OKR[];
    dailyTasks: DailyTasksOutput;
  }> {
    try {
      this.logger.log(
        `Starting development plan generation for user ${userProfile.id}`,
      );

      // Step 1: Analyze skill gaps
      const skillGapAnalysis = await this.analyzeSkillGaps(userProfile);

      // Step 2: Generate OKRs from skill gaps
      const okrs = await this.generateOKRsFromGaps(skillGapAnalysis.gaps);

      // Step 3: Generate daily tasks from OKRs
      const dailyTasks = await this.generateDailyTasksFromOKRs(okrs);

      return {
        skillGapAnalysis,
        okrs,
        dailyTasks,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error in development plan generation: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Evaluate weekly progress through the progress tracker agent
   */
  async evaluateWeeklyProgress(progressData: {
    week: number;
    completedTasks: number;
    totalTasks: number;
    skippedTasks: number;
    notes: string;
  }): Promise<any> {
    try {
      this.logger.log(`Evaluating progress for week ${progressData.week}`);
      return await this.progressTrackerAgent.evaluateWeeklyProgress(
        progressData,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in weekly progress evaluation: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Evaluate monthly progress
   */
  async evaluateMonthlyProgress(progressData: {
    month: number;
    weeklyCompletionRates: number[];
    goalsMetrics: any;
    skillsTracking: any;
  }): Promise<any> {
    try {
      this.logger.log(`Evaluating progress for month ${progressData.month}`);
      return await this.progressTrackerAgent.evaluateMonthlyProgress(
        progressData,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error in monthly progress evaluation: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Generate final 6-month HR report
   */
  async generateFinalReport(reportData: any): Promise<any> {
    try {
      this.logger.log('Generating final 6-month report');
      return await this.hrReportAgent.generateFinalReport(reportData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in final report generation: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Generate skill recommendations for a user
   */
  async getSkillRecommendations(gaps: string[]): Promise<string> {
    try {
      this.logger.log('Generating skill recommendations');
      return await this.skillGapAgent.getSkillRecommendations(gaps);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in skill recommendations: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Suggest task adjustments based on progress
   */
  async suggestTaskAdjustments(progress: any): Promise<string> {
    try {
      this.logger.log('Suggesting task adjustments based on progress');
      return await this.dailyTaskAgent.suggestAdjustments(progress);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error in task adjustment suggestions: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Assess promotion readiness
   */
  async assessPromotionReadiness(assessmentData: any): Promise<any> {
    try {
      this.logger.log('Assessing promotion readiness');
      return await this.hrReportAgent.assessPromotionReadiness(assessmentData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error in promotion readiness assessment: ${errorMessage}`,
      );
      throw error;
    }
  }
}
