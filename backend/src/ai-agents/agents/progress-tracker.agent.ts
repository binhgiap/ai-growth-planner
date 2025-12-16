import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from '../providers/openai.provider';

interface ProgressEvaluation {
  weeklyProgress: {
    completedTasks: number;
    totalTasks: number;
    completionPercentage: number;
    highlights: string[];
    challenges: string[];
  };
  monthlyProgress: {
    overallProgress: number;
    goalsProgress: number;
    skillsImproved: string[];
    areasOfConcern: string[];
    trends: string;
  };
  recommendations: string[];
  nextSteps: string[];
}

/**
 * ProgressTrackerAgent evaluates task completion and progress
 */
@Injectable()
export class ProgressTrackerAgent {
  private systemPrompt = `
You are an expert progress analyst and personal development coach specializing in:
- Objective performance evaluation and progress tracking  
- Learning curve analysis and skill development assessment
- Identifying patterns in task completion and engagement
- Providing actionable feedback and course correction recommendations
- Motivational coaching based on data-driven insights

Your mission is to analyze completion data, performance trends, and learning progress to provide comprehensive evaluation and strategic recommendations for continued development.

EVALUATION FRAMEWORK:
You must assess progress across multiple dimensions:
1. Task Completion Metrics: Completion rates, consistency, quality
2. Learning Progress: Skill development indicators, knowledge acquisition
3. Engagement Patterns: Time investment, effort quality, challenge handling
4. Goal Alignment: Progress toward OKR objectives, milestone achievement
5. Performance Trends: Improvement patterns, consistency, acceleration/deceleration

PROGRESS ANALYSIS CATEGORIES:
- WEEKLY ASSESSMENT: Short-term productivity and task completion analysis
- MONTHLY EVALUATION: Medium-term skill development and goal progress
- TREND ANALYSIS: Performance patterns, learning velocity, consistency metrics
- CHALLENGE IDENTIFICATION: Obstacles, blockers, areas needing support
- SUCCESS RECOGNITION: Achievements, breakthroughs, positive momentum

INSIGHT GENERATION REQUIREMENTS:
1. Quantitative Analysis: Use concrete metrics and percentages
2. Qualitative Assessment: Identify learning patterns and behavioral insights  
3. Predictive Indicators: Forecast likely outcomes based on current trends
4. Actionable Recommendations: Specific, implementable next steps
5. Motivational Messaging: Balanced feedback highlighting progress and areas for improvement

COACHING APPROACH:
- Data-driven insights backed by completion metrics
- Balanced feedback (achievements + improvement areas)
- Specific, actionable recommendations for enhancement
- Forward-looking guidance aligned with 6-month objectives
- Motivational support based on individual progress patterns

Your analysis directly supports continuous improvement and goal achievement throughout the 6-month development journey.
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Evaluate weekly progress
   */
  async evaluateWeeklyProgress(progressData: {
    week: number;
    completedTasks: number;
    totalTasks: number;
    skippedTasks: number;
    notes: string;
  }): Promise<ProgressEvaluation> {
    const userMessage = `
Week ${progressData.week} Progress Report:
- Completed Tasks: ${progressData.completedTasks}
- Total Tasks: ${progressData.totalTasks}
- Skipped Tasks: ${progressData.skippedTasks}
- Notes: ${progressData.notes}

Provide a comprehensive evaluation including:
1. Completion analysis
2. Key achievements and highlights
3. Challenges and blockers
4. Momentum assessment
5. Recommendations for next week
6. Risk factors to monitor
    `;

    return this.openaiProvider.generateJSON<ProgressEvaluation>(
      this.systemPrompt,
      userMessage,
    );
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
    const userMessage = `
Month ${progressData.month} Progress Analysis:
- Weekly Completion Rates: ${progressData.weeklyCompletionRates.join(', ')}%
- Goals Metrics: ${JSON.stringify(progressData.goalsMetrics)}
- Skills Tracking: ${JSON.stringify(progressData.skillsTracking)}

Analyze:
1. Overall progress trend
2. Goal achievement rate
3. Skill development progress
4. Momentum and sustainability
5. Areas of concern
6. Success factors
7. Recommendations for next month
    `;

    return this.openaiProvider.generateJSON<any>(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Generate progress summary
   */
  async generateProgressSummary(
    period: 'week' | 'month' | '6month',
    data: any,
  ): Promise<string> {
    const userMessage = `
Generate a ${period} progress summary based on this data:
${JSON.stringify(data, null, 2)}

Create a narrative summary that is:
- Encouraging but realistic
- Focused on key achievements
- Identifies areas of growth
- Actionable for next period
    `;

    return this.openaiProvider.generateCompletion(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Predict completion rate at end of 6 months
   */
  async predictFinalCompletion(currentProgress: {
    weeksCompleted: number;
    completionRate: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }): Promise<any> {
    const userMessage = `
Based on this progress:
- Weeks Completed: ${currentProgress.weeksCompleted}/26
- Current Completion Rate: ${currentProgress.completionRate}%
- Trend: ${currentProgress.trend}

Predict:
1. Likely completion rate at 6 months
2. Confidence level in prediction
3. Factors that could improve/decrease completion
4. Recommendations to improve trajectory
    `;

    return this.openaiProvider.generateJSON<any>(
      this.systemPrompt,
      userMessage,
    );
  }
}
