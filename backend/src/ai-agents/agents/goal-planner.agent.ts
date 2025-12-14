import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from '../providers/openai.provider';

interface OKR {
  objective: string;
  keyResults: Array<{
    result: string;
    milestone: string;
    metrics: string;
  }>;
  timeline: string;
}

/**
 * GoalPlannerAgent converts skill gaps into 6-month OKRs
 */
@Injectable()
export class GoalPlannerAgent {
  private systemPrompt = `
You are a strategic planning expert specializing in personal development goals.
Your task is to convert skill gaps into achievable Objectives & Key Results (OKRs) for a 6-month period.
Return structured JSON with clear, measurable goals.
Format: {
  "objectives": [
    {
      "objective": "",
      "keyResults": [
        {"result": "", "milestone": "", "metrics": ""}
      ],
      "timeline": ""
    }
  ],
  "summary": ""
}
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Generate 6-month OKRs from skill gaps
   */
  async generateOKRs(
    skillGaps: {
      skill: string;
      importance: string;
      currentLevel: number;
      targetLevel: number;
    }[],
  ): Promise<OKR[]> {
    const userMessage = `
Based on these priority skill gaps:
${skillGaps.map((gap) => `- ${gap.skill} (${gap.importance} priority, current level: ${gap.currentLevel}/5, target: ${gap.targetLevel}/5)`).join('\n')}

Create a 6-month development plan with clear objectives and key results.
Each objective should be specific, measurable, and achievable.
    `;

    const response = await this.openaiProvider.generateJSON<{
      objectives: Array<{
        objective: string;
        keyResults: Array<{
          result: string;
          milestone: string;
          metrics: string;
        }>;
        timeline: string;
      }>;
      summary: string;
    }>(this.systemPrompt, userMessage);

    return response.objectives || [];
  }

  /**
   * Break down OKRs into milestones
   */
  async createMilestones(
    objective: string,
    keyResults: string[],
  ): Promise<any> {
    const userMessage = `
Objective: ${objective}
Key Results: ${keyResults.join(', ')}

Create a detailed milestone plan with:
1. Monthly milestones (6 months)
2. Key deliverables for each milestone
3. Success metrics
4. Risk factors and mitigation strategies
    `;

    return this.openaiProvider.generateJSON<any>(
      this.systemPrompt,
      userMessage,
    );
  }
}
