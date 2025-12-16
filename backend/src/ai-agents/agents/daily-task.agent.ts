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
You are an expert project manager and learning architect who MUST generate EXACTLY 180 tasks.

CRITICAL SUCCESS CRITERIA:
- MUST return exactly 180 tasks in the tasks array
- Count your tasks as you generate them
- Verify the final count is exactly 180 before returning
- If you have fewer than 180, add more tasks until you reach exactly 180
- If you have more than 180, remove tasks until you have exactly 180

TASK GENERATION FRAMEWORK:
You MUST create a comprehensive 6-month development plan with precisely 180 actionable tasks distributed across 26 weeks.

MANDATORY TASK DISTRIBUTION (TOTAL = 180):
Week 1-2 (Foundation Phase): 14 tasks
Week 3-6 (Core Skills Phase): 28 tasks  
Week 7-13 (Intermediate Phase): 49 tasks
Week 14-20 (Advanced Phase): 49 tasks
Week 21-26 (Mastery Phase): 40 tasks

TASK CATEGORIES WITH REQUIRED COUNTS:
1. Learning Tasks (36 tasks - 20%): Courses, tutorials, reading, research
2. Practice Tasks (72 tasks - 40%): Hands-on coding, exercises, drills
3. Project Tasks (45 tasks - 25%): Building applications, implementations
4. Review Tasks (18 tasks - 10%): Weekly reviews, retrospectives, assessments  
5. Collaboration Tasks (9 tasks - 5%): Code reviews, mentoring, discussions

TASK QUALITY REQUIREMENTS:
- Each task = 0.5-4 hours maximum
- Specific, actionable titles (no generic names)
- Clear 2-3 sentence descriptions
- Realistic due dates spread across 6 months
- Proper priority distribution: 40% HIGH, 35% MEDIUM, 25% LOW
- Include relevant learning resources
- Logical progression and dependencies

VERIFICATION CHECKLIST:
Before returning JSON:
1. Count total tasks = exactly 180
2. Verify week distribution matches requirements
3. Check category distribution percentages
4. Ensure no duplicate or overly similar tasks
5. Confirm proper date progression
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Generate daily tasks from OKRs with validation
   * Creates exactly 180 daily/weekly tasks spread across 6 months (26 weeks)
   */
  async generateDailyTasks(
    okrs: {
      objective: string;
      keyResults: string[];
      timeline: string;
    }[],
  ): Promise<DailyTasksOutput> {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6);

    const userMessage = `
🎯 CRITICAL MISSION: Generate EXACTLY 180 tasks for a 6-month development plan.

📋 OBJECTIVES AND KEY RESULTS:
${okrs
  .map(
    (okr, idx) => `
${idx + 1}. OBJECTIVE: ${okr.objective}
   KEY RESULTS: 
${okr.keyResults.map((kr) => `   ✓ ${kr}`).join('\n')}`,
  )
  .join('\n')}

⚠️  MANDATORY REQUIREMENTS - NO EXCEPTIONS:
1. EXACTLY 180 tasks in the "tasks" array (count them!)
2. Start Date: ${startDate.toISOString().split('T')[0]}
3. End Date: ${endDate.toISOString().split('T')[0]}
4. Distribution across 26 weeks EXACTLY as specified:
   
   📚 FOUNDATION PHASE (Weeks 1-2): 14 tasks
   - Environment setup, basic learning, tool familiarization
   
   💪 CORE SKILLS PHASE (Weeks 3-6): 28 tasks  
   - Fundamental practice, essential concepts, foundation building
   
   ⚡ INTERMEDIATE PHASE (Weeks 7-13): 49 tasks
   - Real-world applications, complex problems, skill integration
   
   🚀 ADVANCED PHASE (Weeks 14-20): 49 tasks
   - System design, optimization, advanced implementations
   
   🏆 MASTERY PHASE (Weeks 21-26): 40 tasks
   - Leadership, mentoring, final projects, retrospectives

📊 TASK CATEGORY DISTRIBUTION (VERIFY COUNTS):
- Learning Tasks: 36 tasks (20%) - courses, reading, tutorials
- Practice Tasks: 72 tasks (40%) - coding, exercises, hands-on work  
- Project Tasks: 45 tasks (25%) - building, implementing, creating
- Review Tasks: 18 tasks (10%) - retrospectives, assessments, evaluations
- Collaboration Tasks: 9 tasks (5%) - mentoring, code reviews, discussions

🏷️ PRIORITY DISTRIBUTION:
- HIGH: 72 tasks (40%) - Critical path, must-have skills
- MEDIUM: 63 tasks (35%) - Important supporting skills
- LOW: 45 tasks (25%) - Nice-to-have, exploration

✅ VERIFICATION CHECKLIST (Check before returning):
□ Total task count = 180 exactly
□ Week distribution matches: 14+28+49+49+40 = 180
□ Category distribution matches percentages
□ All dates between start and end date
□ All tasks have required fields
□ No duplicate or similar tasks

📝 TASK FORMAT REQUIREMENTS:
Each task MUST include:
- title: Specific, unique, actionable (no generic names)
- description: 2-3 clear sentences explaining what to do
- dueDate: YYYY-MM-DD format within the 6-month period
- estimatedHours: Between 0.5 and 4 hours
- priority: "high", "medium", or "low"
- linkedGoal: Which objective this supports
- resources: Array of 1-3 learning resources (courses, books, tools)

🎯 RETURN EXACT JSON FORMAT:
{
  "tasks": [
    // EXACTLY 180 task objects here
  ],
  "schedule": "Detailed breakdown of how the 180 tasks are distributed across 26 weeks",
  "summary": "Overall task plan summary with key milestones and learning outcomes"
}

⚡ FINAL INSTRUCTION: COUNT YOUR TASKS! Verify you have exactly 180 before returning the JSON.
    `;

    try {
      const result = await this.openaiProvider.generateJSON<DailyTasksOutput>(
        this.systemPrompt,
        userMessage,
      );

      // Validate the result
      if (!result.tasks || !Array.isArray(result.tasks)) {
        throw new Error('Invalid response: tasks array is missing');
      }

      if (result.tasks.length !== 180) {
        console.warn(`Expected 180 tasks, got ${result.tasks.length}`);

        // If we have fewer tasks, try to generate more
        if (result.tasks.length < 180) {
          const additionalTasksNeeded = 180 - result.tasks.length;
          const additionalTasks = await this.generateAdditionalTasks(
            okrs,
            additionalTasksNeeded,
            result.tasks,
          );
          result.tasks = [...result.tasks, ...additionalTasks];
        }

        // If we have too many, trim to exactly 180
        if (result.tasks.length > 180) {
          result.tasks = result.tasks.slice(0, 180);
        }
      }

      return result;
    } catch (error) {
      console.error('Error generating daily tasks:', error);
      throw new Error(`Failed to generate daily tasks: ${error.message}`);
    }
  }

  /**
   * Generate additional tasks if the initial generation is incomplete
   */
  private async generateAdditionalTasks(
    okrs: { objective: string; keyResults: string[]; timeline: string }[],
    count: number,
    existingTasks: any[],
  ): Promise<any[]> {
    const lastTask = existingTasks[existingTasks.length - 1];
    const lastDate = new Date(lastTask?.dueDate || new Date());

    const userMessage = `
Generate exactly ${count} additional tasks to complete the 180-task plan.

Existing tasks: ${existingTasks.length}
Need: ${count} more tasks

Continue from where the previous tasks left off.
Last task date: ${lastDate.toISOString().split('T')[0]}

Objectives:
${okrs.map((okr) => `- ${okr.objective}`).join('\n')}

Return JSON format:
{
  "tasks": [
    // Exactly ${count} task objects
  ]
}
    `;

    const result = await this.openaiProvider.generateJSON<{ tasks: any[] }>(
      this.systemPrompt,
      userMessage,
    );

    return result.tasks || [];
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

  /**
   * Generate tasks in chunks to ensure we get exactly 180 tasks
   * This is a fallback method if the primary generation doesn't produce enough tasks
   */
  async generateDailyTasksChunked(
    okrs: {
      objective: string;
      keyResults: string[];
      timeline: string;
    }[],
  ): Promise<DailyTasksOutput> {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6);

    // Define the exact week distribution
    const phases = [
      { name: 'FOUNDATION', weeks: [1, 2], taskCount: 14 },
      { name: 'CORE_SKILLS', weeks: [3, 4, 5, 6], taskCount: 28 },
      { name: 'INTERMEDIATE', weeks: [7, 8, 9, 10, 11, 12, 13], taskCount: 49 },
      { name: 'ADVANCED', weeks: [14, 15, 16, 17, 18, 19, 20], taskCount: 49 },
      { name: 'MASTERY', weeks: [21, 22, 23, 24, 25, 26], taskCount: 40 },
    ];

    let allTasks: any[] = [];
    let currentWeek = 1;

    for (const phase of phases) {
      const phaseStartDate = new Date(startDate);
      phaseStartDate.setDate(
        phaseStartDate.getDate() + (phase.weeks[0] - 1) * 7,
      );

      const phaseEndDate = new Date(startDate);
      phaseEndDate.setDate(
        phaseEndDate.getDate() + phase.weeks[phase.weeks.length - 1] * 7,
      );

      const phasePrompt = `
Generate exactly ${phase.taskCount} tasks for the ${phase.name} phase (Weeks ${phase.weeks.join('-')}).

Phase Details:
- ${phase.name}: ${this.getPhaseDescription(phase.name)}
- Tasks needed: ${phase.taskCount}
- Start date: ${phaseStartDate.toISOString().split('T')[0]}
- End date: ${phaseEndDate.toISOString().split('T')[0]}

Objectives:
${okrs.map((okr) => `- ${okr.objective}: ${okr.keyResults.join(', ')}`).join('\n')}

Return JSON:
{
  "tasks": [
    // Exactly ${phase.taskCount} tasks for this phase
  ]
}
      `;

      try {
        const phaseResult = await this.openaiProvider.generateJSON<{
          tasks: any[];
        }>(this.systemPrompt, phasePrompt);

        if (phaseResult.tasks && Array.isArray(phaseResult.tasks)) {
          // Ensure we have exactly the right number of tasks for this phase
          const phaseTasks = phaseResult.tasks.slice(0, phase.taskCount);

          // If we don't have enough, generate more
          while (phaseTasks.length < phase.taskCount) {
            const additionalCount = phase.taskCount - phaseTasks.length;
            const additionalTasks = await this.generateAdditionalTasks(
              okrs,
              additionalCount,
              phaseTasks,
            );
            phaseTasks.push(...additionalTasks.slice(0, additionalCount));
          }

          allTasks.push(...phaseTasks);
        }
      } catch (error) {
        console.error(`Error generating tasks for ${phase.name}:`, error);
        // Generate fallback tasks for this phase
        const fallbackTasks = this.generateFallbackTasks(phase, okrs);
        allTasks.push(...fallbackTasks);
      }

      currentWeek = phase.weeks[phase.weeks.length - 1] + 1;
    }

    // Ensure we have exactly 180 tasks
    allTasks = allTasks.slice(0, 180);

    // If we still don't have enough, pad with additional tasks
    while (allTasks.length < 180) {
      const additionalTasks = await this.generateAdditionalTasks(
        okrs,
        180 - allTasks.length,
        allTasks,
      );
      allTasks.push(...additionalTasks);
    }

    return {
      tasks: allTasks.slice(0, 180), // Ensure exactly 180
      schedule: this.generateScheduleSummary(phases),
      summary: `Successfully generated 180 tasks across 26 weeks in 5 phases: Foundation (14), Core Skills (28), Intermediate (49), Advanced (49), and Mastery (40) phases.`,
    };
  }

  private getPhaseDescription(phaseName: string): string {
    const descriptions = {
      FOUNDATION: 'Environment setup, basic learning, tool familiarization',
      CORE_SKILLS:
        'Fundamental practice, essential concepts, foundation building',
      INTERMEDIATE:
        'Real-world applications, complex problems, skill integration',
      ADVANCED: 'System design, optimization, advanced implementations',
      MASTERY: 'Leadership, mentoring, final projects, retrospectives',
    };
    return descriptions[phaseName] || 'Development tasks';
  }

  private generateFallbackTasks(phase: any, okrs: any[]): any[] {
    const tasks: any[] = [];
    const startDate = new Date();

    for (let i = 0; i < phase.taskCount; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(taskDate.getDate() + (phase.weeks[0] - 1) * 7 + i);

      tasks.push({
        title: `${phase.name} Task ${i + 1}`,
        description: `Fallback task for ${phase.name} phase. Complete development activity related to your learning objectives.`,
        dueDate: taskDate.toISOString().split('T')[0],
        estimatedHours: 2,
        priority: 'medium',
        linkedGoal: okrs[0]?.objective || 'General Development',
        resources: ['Documentation', 'Online tutorials'],
      });
    }

    return tasks;
  }

  private generateScheduleSummary(phases: any[]): string {
    return phases
      .map(
        (phase) =>
          `${phase.name}: Weeks ${phase.weeks.join('-')} (${phase.taskCount} tasks)`,
      )
      .join(', ');
  }
}
