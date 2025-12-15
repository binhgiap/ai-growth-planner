import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from '../providers/openai.provider';

interface SkillGapAnalysis {
  currentSkills: string[];
  targetSkills: string[];
  gaps: Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    currentLevel: number; // 0-5
    targetLevel: number; // 0-5
  }>;
  prioritizedGaps: string[];
  summary: string;
}

/**
 * SkillGapAgent analyzes skill gaps between current and target role
 */
@Injectable()
export class SkillGapAgent {
  private systemPrompt = `
You are an expert HR consultant and career coach specializing in:
- Skills assessment and gap analysis
- Career progression planning
- Learning path design
- Identifying skill dependencies and prerequisites
- Realistic skill level assessment

Your task is to analyze skill gaps between current and target roles and create a comprehensive skill development roadmap.

SKILL ANALYSIS REQUIREMENTS:
1. Assess all current skills objectively
2. Identify all required target skills
3. Determine learning priority and sequencing
4. Estimate realistic proficiency levels (0-5 scale)
5. Group related skills effectively
6. Create a strategic development path

IMPORTANCE LEVELS:
- CRITICAL: Must-have for role success, often prerequisites for other skills
- HIGH: Very important, directly impacts job performance
- MEDIUM: Important but can be developed in parallel, nice-to-have enhancements
- LOW: Optional or lower priority, can be learned later

PROFICIENCY SCALE (0-5):
- 0: No knowledge
- 1: Minimal knowledge, needs significant development
- 2: Basic understanding, can perform simple tasks with guidance
- 3: Intermediate, can work independently on standard tasks
- 4: Advanced, can handle complex scenarios, can mentor others
- 5: Expert level, deep mastery, can innovate and lead

SKILL CATEGORIZATION:
- Technical Skills: Programming, tools, frameworks
- Domain Skills: Business, industry-specific knowledge
- Soft Skills: Communication, leadership, collaboration
- Methodological Skills: Processes, frameworks, methodologies

Output valid JSON with all required fields and comprehensive gap analysis.
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Analyze skill gaps for a user
   * Creates detailed skill gap analysis with prioritization
   */
  async analyzeSkillGaps(userProfile: {
    currentRole: string;
    targetRole: string;
    skills: string[];
    targetSkills: string[];
    yearsExperience?: number;
  }): Promise<SkillGapAnalysis> {
    const userMessage = `
You are an expert HR consultant specializing in skills analysis and career development.
Analyze the skill gaps between current and target role to create a comprehensive development plan.

CURRENT SITUATION:
- Current Role: ${userProfile.currentRole}
- Target Role: ${userProfile.targetRole}
- Years of Experience: ${userProfile.yearsExperience || 'Not specified'}
- Current Skills: ${userProfile.skills.join(', ')}

TARGET REQUIREMENTS:
- Target Skills Needed: ${userProfile.targetSkills.join(', ')}

ANALYSIS REQUIREMENTS:
1. Identify ALL current skills clearly
2. Identify ALL target skills needed for the role
3. For each gap, determine:
   - Skill name
   - Importance level: critical/high/medium/low
   - Current proficiency: 0-5 scale (0=no knowledge, 5=expert)
   - Target proficiency: 0-5 scale
4. Prioritize gaps by impact and feasibility
5. Group related skills together
6. Provide a strategic summary

SKILL GAP ANALYSIS STRUCTURE:
- Identify 8-15 distinct skill gaps
- Critical gaps: These are blockers/prerequisites for the role
- High gaps: Important but can be learned in parallel
- Medium gaps: Nice-to-have but beneficial
- Low gaps: Optional or lower priority

PRIORITIZATION RULES:
1. Skills that are prerequisites should be ranked higher
2. Critical skills for the target role must be included
3. Consider learning dependencies (some skills build on others)
4. Factor in existing experience (closer gaps = lower priority sometimes)

Return valid JSON with detailed gaps array, prioritized gaps, and summary.

EXPECTED OUTPUT:
{
  "currentSkills": ["Skill1", "Skill2", ...],
  "targetSkills": ["NewSkill1", "NewSkill2", ...],
  "gaps": [
    {
      "skill": "Specific skill name",
      "importance": "critical",
      "currentLevel": 1,
      "targetLevel": 4
    },
    ... (8-15 gaps total)
  ],
  "prioritizedGaps": ["Gap1", "Gap2", ...],
  "summary": "Strategic summary of skill development path"
}
    `;

    return this.openaiProvider.generateJSON<SkillGapAnalysis>(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Get skill learning recommendations
   */
  async getSkillRecommendations(gaps: string[]): Promise<string> {
    const userMessage = `
Based on these skill gaps: ${gaps.join(', ')}

Provide specific, actionable recommendations for addressing these gaps.
Focus on:
1. Learning resources (courses, books, projects)
2. Timeline for skill development
3. Practice opportunities
4. Mentorship or collaboration opportunities
    `;

    return this.openaiProvider.generateCompletion(
      this.systemPrompt,
      userMessage,
    );
  }
}
