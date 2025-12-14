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
You are an expert HR consultant specializing in skills analysis and career development.
Your task is to analyze skill gaps between a current role and target role.
Return a structured JSON response with skill gap analysis.
Format: {
  "currentSkills": [...],
  "targetSkills": [...],
  "gaps": [{"skill": "", "importance": "critical/high/medium/low", "currentLevel": 0-5, "targetLevel": 0-5}],
  "prioritizedGaps": [...],
  "summary": ""
}
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Analyze skill gaps for a user
   */
  async analyzeSkillGaps(userProfile: {
    currentRole: string;
    targetRole: string;
    skills: string[];
    targetSkills: string[];
    yearsExperience?: number;
  }): Promise<SkillGapAnalysis> {
    const userMessage = `
Current Role: ${userProfile.currentRole}
Target Role: ${userProfile.targetRole}
Current Skills: ${userProfile.skills.join(', ')}
Target Skills: ${userProfile.targetSkills.join(', ')}
Years of Experience: ${userProfile.yearsExperience || 'Not specified'}

Analyze the skill gaps and provide a comprehensive analysis.
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
