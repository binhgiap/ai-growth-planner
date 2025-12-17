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
You are a strategic planning expert and career development coach specializing in:
- Converting skill gaps into achievable SMART goals
- Creating comprehensive 6-month OKR frameworks
- Designing progressive learning paths with clear milestones
- Balancing technical and soft skill development
- Ensuring realistic yet ambitious goal setting

Your mission is to transform identified skill gaps into a structured 6-month development plan using the OKR methodology.

CORE REQUIREMENTS:
1. Generate 4-6 OBJECTIVES (Strategic high-level goals)
2. Each objective = 2-3 KEY RESULTS (Measurable outcomes)
3. Timeline spans exactly 6 months (26 weeks)
4. Goals must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound
5. Progressive difficulty: Foundation → Intermediate → Advanced

OBJECTIVE CREATION PRINCIPLES:
- Address CRITICAL skills first (foundational requirements)
- Group related skills into coherent objectives  
- Build logical dependencies between objectives
- Balance learning, practice, and application
- Include both technical and soft skills where applicable

KEY RESULT SPECIFICATIONS:
Each Key Result MUST include:
- RESULT: Clear, specific outcome statement
- MILESTONE: Concrete progress markers (Month 3 and Month 6 targets)
- METRICS: Quantifiable success criteria (numbers, percentages, completions)

TIMELINE DISTRIBUTION:
- Objective 1-2: Foundation Phase (Months 1-2) - Critical skills, environment setup
- Objective 3-4: Development Phase (Months 3-4) - Core skills, intermediate practice  
- Objective 5-6: Mastery Phase (Months 5-6) - Advanced application, real-world projects

SUCCESS CRITERIA:
- Every objective directly addresses skill gaps
- Key results are measurable and achievable
- Timeline allows for proper skill development
- Goals create a cohesive learning journey
- Output format enables downstream task generation

Output MUST be valid JSON with clear structure for task generation pipeline.
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
🎯 MISSION: Generate comprehensive 6-month OKRs from skill gap analysis.

📊 SKILL GAPS TO ADDRESS:
${skillGaps
  .map(
    (gap) =>
      `🔸 SKILL: ${gap.skill}
   📈 IMPORTANCE: ${gap.importance.toUpperCase()}
   📍 CURRENT: ${gap.currentLevel}/5 → TARGET: ${gap.targetLevel}/5
   📏 GAP SIZE: ${gap.targetLevel - gap.currentLevel} levels`,
  )
  .join('\n')}

⚠️ CRITICAL REQUIREMENTS:
1. Generate EXACTLY 4-6 OBJECTIVES (no more, no less)
2. Each objective = 2-3 KEY RESULTS (measurable outcomes)
3. Timeline = 6 months (26 weeks) total
4. Progressive difficulty: Foundation → Intermediate → Advanced
5. Address CRITICAL and HIGH importance skills first

🏗️ OBJECTIVE CREATION STRATEGY:
- FOUNDATION (Months 1-2): Environment setup, basic concepts, critical skills
- DEVELOPMENT (Months 3-4): Core practices, intermediate skills, hands-on experience  
- MASTERY (Months 5-6): Advanced applications, real projects, leadership skills

📋 KEY RESULT SPECIFICATIONS:
Each Key Result MUST have:
✓ RESULT: Specific, actionable outcome statement
✓ MILESTONE: Progress targets (Month 3 checkpoint + Month 6 final goal)
✓ METRICS: Quantifiable success criteria (numbers, completions, assessments)

🎯 EXAMPLE STRUCTURE:
{
  "objective": "Master Backend Development Fundamentals",
  "keyResults": [
    {
      "result": "Build proficiency in Node.js and Express framework",
      "milestone": "Month 3: Complete 3 backend projects; Month 6: Deploy 2 production-ready APIs",
      "metrics": "3 completed projects, 2 deployed APIs, 90%+ test coverage, performance benchmarks met"
    },
    {
      "result": "Implement database design and management skills", 
      "milestone": "Month 3: Design 2 database schemas; Month 6: Optimize 3 database queries for production",
      "metrics": "2 schema designs, 3 query optimizations, 50% performance improvement"
    }
  ],
  "timeline": "Months 1-6: Foundation to Production Implementation"
}

🔄 PROGRESSIVE LEARNING PATH:
- Objective 1: Address CRITICAL skills (foundation requirements)
- Objective 2-3: Develop HIGH importance skills (core competencies)  
- Objective 4-5: Apply MEDIUM skills (practical experience)
- Objective 6: Integrate skills (advanced projects, if skill gaps require)

✅ VALIDATION CHECKLIST:
□ All CRITICAL skills addressed in first 1-2 objectives
□ Each objective spans roughly 1.5 months average
□ Key results are measurable and specific
□ Milestones show clear 3-month and 6-month progress
□ Timeline enables realistic skill development
□ Goals create logical progression for daily task generation

📤 RETURN FORMAT:
{
  "objectives": [
    // 4-6 objective objects with the structure above
  ],
  "summary": "Strategic overview of the 6-month development plan with key focus areas and expected outcomes"
}

🚨 CRITICAL: These OKRs will be used to generate 180 daily tasks. Ensure objectives are specific enough to enable detailed task breakdown.
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
