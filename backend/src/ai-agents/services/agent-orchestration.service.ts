import { Injectable, Logger } from '@nestjs/common';
import { SkillGapAgent } from '../agents/skill-gap.agent';
import { GoalPlannerAgent } from '../agents/goal-planner.agent';
import { DailyTaskAgent } from '../agents/daily-task.agent';
import { ProgressTrackerAgent } from '../agents/progress-tracker.agent';
import { HRReportAgent } from '../agents/hr-report.agent';

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
   * Orchestrate complete 6-month development plan generation
   * Calls agents in sequence: SkillGap → Goals → Tasks → Progress Setup
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
    skillGapAnalysis: any;
    okrs: any[];
    dailyTasks: any;
  }> {
    try {
      this.logger.log(
        `Starting development plan generation for user ${userProfile.id}`,
      );

      // Step 1: Analyze skill gaps
      this.logger.log('Step 1: Analyzing skill gaps...');
      const skillGapAnalysis =
        await this.skillGapAgent.analyzeSkillGaps(userProfile);
      this.logger.log('Skill gap analysis completed');

      // Step 2: Generate OKRs from skill gaps
      this.logger.log('Step 2: Generating 6-month OKRs...');
      const okrs = await this.goalPlannerAgent.generateOKRs(
        skillGapAnalysis.gaps || [],
      );
      this.logger.log('OKRs generated successfully');

      // Step 3: Generate daily tasks from OKRs
      this.logger.log('Step 3: Generating 180 daily tasks...');
      const dailyTasks = await this.dailyTaskAgent.generateDailyTasks(
        okrs.map((okr) => ({
          objective: okr.objective,
          keyResults: okr.keyResults.map((kr) => kr.result),
          timeline: okr.timeline,
        })),
      );
      this.logger.log('Daily tasks generated successfully');

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
