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
You are an experienced project manager and learning specialist with expertise in:
- Breaking down complex goals into micro-tasks
- Creating realistic timelines and schedules
- Prioritizing work based on impact and dependencies
- Designing learning paths and skill development
- Balancing theory and practice in technical development

Your task is to generate detailed, actionable tasks for a 6-month personal development plan.

GUIDELINES FOR TASK GENERATION:
1. Each task must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound
2. Tasks should vary in type: reading, practice, projects, presentations, reviews
3. Include learning resources with each task
4. Respect task dependencies (prerequisites before advanced tasks)
5. Ensure realistic time estimates (0.5-4 hours per task)
6. Balance theory and practice throughout the timeline
7. Include regular review and retrospective tasks
8. Generate EXACTLY the requested number of tasks (typically 180)

TASK TYPES TO INCLUDE:
- Learning tasks (courses, reading, tutorials)
- Practice tasks (coding, design, exercises)
- Project tasks (building, implementing, experimenting)
- Collaboration tasks (code review, mentoring, discussion)
- Reflection tasks (weekly review, journaling, retrospectives)
- Assessment tasks (testing knowledge, mock interviews, presentations)

TIME DISTRIBUTION:
- 20% learning/understanding
- 40% practice/hands-on work
- 25% application/projects
- 10% review/reflection
- 5% collaboration/mentoring

QUALITY STANDARDS:
- No duplicate or similar tasks
- Clear dependencies indicated
- Realistic and motivating progression
- Mixed difficulty levels throughout
- Include breaks and flexibility weeks
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Generate daily tasks from OKRs
   * Creates exactly 180 daily/weekly tasks spread across 6 months (26 weeks)
   */
  async generateDailyTasks(
    okrs: {
      objective: string;
      keyResults: string[];
      timeline: string;
    }[],
  ): Promise<DailyTasksOutput> {
    const userMessage = `
You are a project management expert. Your task is to generate EXACTLY 180 actionable tasks for a 6-month development plan.

OBJECTIVES AND KEY RESULTS:
${okrs
  .map(
    (okr, idx) => `
${idx + 1}. OBJECTIVE: ${okr.objective}
   KEY RESULTS: ${okr.keyResults.join('\n   - ')}`,
  )
  .join('\n')}

REQUIREMENTS:
1. Generate EXACTLY 180 tasks (not fewer)
2. Distribute tasks across 26 weeks (roughly 7 tasks per week)
3. Start date: Today
4. End date: 6 months from today
5. Each task must have:
   - Unique, specific title (avoid generic names)
   - Detailed description (2-3 sentences)
   - Due date (YYYY-MM-DD format)
   - Estimated hours (0.5 to 4 hours per task)
   - Priority: high/medium/low
   - Linked goal/objective
   - Learning resources (courses, books, tools, etc.)

TASK DISTRIBUTION STRATEGY:
- Week 1-2 (14 tasks): Foundation & Setup - learning resources, environment setup, basic concepts
- Week 3-6 (28 tasks): Core Skills - fundamental skills, hands-on practice, small projects
- Week 7-13 (49 tasks): Intermediate Application - complex problems, real-world scenarios, collaborative work
- Week 14-20 (49 tasks): Advanced Implementation - system design, optimization, leadership tasks
- Week 21-26 (40 tasks): Mastery & Review - mentoring, documentation, final projects, retrospectives

PRIORITY GUIDELINES:
- HIGH (40%): Critical path tasks, blockers, core skill requirements
- MEDIUM (35%): Important supporting tasks, reinforcement, related skills
- LOW (25%): Nice-to-have, optional deep dives, exploration tasks

SPECIFIC INSTRUCTIONS:
- Tasks must be realistic and achievable
- Include variety: reading, coding, design, presentation, mentoring, projects
- Break down large goals into micro-tasks
- Ensure dependencies make sense (prerequisites before advanced tasks)
- Add weekly review/retrospective tasks
- Include time for breaks and flexibility

Return valid JSON with this exact structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description of what to do",
      "dueDate": "YYYY-MM-DD",
      "estimatedHours": 2,
      "priority": "high|medium|low",
      "linkedGoal": "Objective name",
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "schedule": "Summary of how tasks are distributed across the 26 weeks",
  "summary": "Overall task plan summary"
}
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
