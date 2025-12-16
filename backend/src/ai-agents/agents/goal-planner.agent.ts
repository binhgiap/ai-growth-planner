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
You are a strategic planning expert specializing in personal development and career growth.
You excel at:
- Converting skill gaps into achievable goals (OKRs)
- Setting measurable key results with clear success criteria
- Creating realistic timelines that span 6 months
- Balancing multiple learning objectives
- Ensuring goals are aligned and build on each other
- Making goals motivating and achievable

Your task is to create a comprehensive 6-month OKR (Objectives & Key Results) plan that:
1. Addresses identified skill gaps strategically
2. Provides clear, measurable outcomes
3. Builds from foundational to advanced skills
4. Includes realistic milestones at months 3 and 6
5. Specifies concrete success metrics
6. Creates a logical progression

OKR FORMAT REQUIREMENTS:
- OBJECTIVE: High-level goal statement (what to achieve)
- KEY RESULTS: 2-3 measurable outcomes (how to measure success)
  - Each KR includes: specific result, milestone targets (month 3 & 6), success metrics
- TIMELINE: Indicates the 6-month progression

GOAL CHARACTERISTICS:
- Specific: Clear and well-defined
- Measurable: Quantifiable success criteria
- Achievable: Realistic within 6 months
- Relevant: Directly addresses skill gaps
- Time-bound: Clear timeline and milestones

Output valid JSON with objectives array and summary.
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Generate 6-month OKRs from skill gaps
   * Creates 4-6 clear objectives with measurable key results
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
You are a strategic planning expert specializing in personal development goals.
Generate a comprehensive 6-month OKR plan from these skill gaps.

SKILL GAPS TO ADDRESS:
${skillGaps
  .map(
    (gap) =>
      `- Skill: ${gap.skill}
   Importance: ${gap.importance}
   Current Level: ${gap.currentLevel}/5
   Target Level: ${gap.targetLevel}/5`,
  )
  .join('\n')}

REQUIREMENTS FOR OKRs:
1. Create 4-6 clear OBJECTIVES (not more, not less)
2. Each objective must have 2-3 KEY RESULTS
3. Each key result must have:
   - Specific result statement
   - Monthly milestone (progress target for month 3 and 6)
   - Measurable success metrics
4. Timeline: 6 months total
5. Include both technical and soft skills
6. Objectives should build on each other progressively

OKR STRUCTURE GUIDELINES:
- Start with foundational skills (Months 1-2)
- Progress to intermediate skills (Months 3-4)
- Move to advanced/application skills (Months 5-6)
- Each objective should take roughly 1.5 months on average

EXAMPLE FORMAT (but with actual content):
{
  "objective": "Master System Design Principles",
  "keyResults": [
    {
      "result": "Understand distributed system architecture and design patterns",
      "milestone": "Month 3: Complete 3 system design case studies; Month 6: Design 2 production-scale systems",
      "metrics": "3 documented case studies, 2 system design documents, ability to discuss tradeoffs"
    },
    {
      "result": "Apply system design to real-world problems",
      "milestone": "Month 3: Complete 2 design exercises; Month 6: Lead 1 architecture review",
      "metrics": "Completion of exercises, peer feedback score >8/10"
    },
    {
      "result": "Communicate system design effectively",
      "milestone": "Month 3: Present 1 design; Month 6: Present 3 designs with Q&A",
      "metrics": "Presentation count, audience comprehension score, feedback ratings"
    }
  ],
  "timeline": "Month 1-6: Foundation to Advanced"
}

PRIORITY HANDLING:
- CRITICAL skills: Dedicate first objective
- HIGH skills: Second and third objectives
- MEDIUM skills: Later objectives or can be combined
- LOW skills: Only if critical skills met first

Return VALID JSON with objectives array and summary.
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
