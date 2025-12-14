import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from '../providers/openai.provider';

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
 * DailyTaskAgent converts OKRs into 180 actionable daily/weekly tasks
 */
@Injectable()
export class DailyTaskAgent {
  private systemPrompt = `
You are a project management expert specializing in task breakdown and scheduling.
Your task is to convert OKRs into concrete, actionable daily tasks for a 6-month period (~180 days).
Return structured JSON with a prioritized task list.
Format: {
  "tasks": [
    {
      "title": "",
      "description": "",
      "dueDate": "YYYY-MM-DD",
      "estimatedHours": number,
      "priority": "high/medium/low",
      "linkedGoal": "",
      "resources": []
    }
  ],
  "schedule": "",
  "summary": ""
}
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Generate daily tasks from OKRs
   */
  async generateDailyTasks(
    okrs: {
      objective: string;
      keyResults: string[];
      timeline: string;
    }[],
  ): Promise<DailyTasksOutput> {
    const userMessage = `
Based on these OKRs:
${okrs.map((okr) => `- Objective: ${okr.objective}\n  Key Results: ${okr.keyResults.join(', ')}`).join('\n')}

Generate a comprehensive list of 180 daily/weekly tasks that break down these OKRs.
Consider:
1. Task dependencies and sequencing
2. Realistic time estimates
3. Priority levels based on impact
4. Resource requirements
5. Weekly and monthly rhythms

Each task should be:
- Specific and actionable
- Have a clear due date
- Include estimated hours
- Link back to an OKR
    `;

    return this.openaiProvider.generateJSON<DailyTasksOutput>(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Generate weekly task plan
   */
  async generateWeeklyTasks(
    weekNumber: number,
    relatedGoals: string[],
  ): Promise<any> {
    const userMessage = `
Generate a detailed task plan for week ${weekNumber} of the 6-month development plan.

Related Goals: ${relatedGoals.join(', ')}

Include:
1. 5-7 main tasks for the week
2. Daily breakdown
3. Check-in points
4. Success criteria
5. Flexibility for overrun items
    `;

    return this.openaiProvider.generateJSON<any>(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Suggest task adjustments based on progress
   */
  async suggestAdjustments(progress: {
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    completionRate: number;
  }): Promise<string> {
    const userMessage = `
Based on this progress:
- Completion Rate: ${progress.completionRate}%
- Completed Tasks: ${progress.completedTasks}/${progress.totalTasks}
- Overdue Tasks: ${progress.overdueTasks}

Suggest task adjustments to:
1. Improve completion rate
2. Prioritize high-impact tasks
3. Manage workload better
4. Maintain momentum
    `;

    return this.openaiProvider.generateCompletion(
      this.systemPrompt,
      userMessage,
    );
  }
}
