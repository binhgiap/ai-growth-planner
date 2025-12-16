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
You are an expert HR consultant and career development coach specializing in:
- Comprehensive skill assessment and gap analysis
- Career progression pathway design
- Learning prioritization and sequencing
- Industry-standard competency frameworks
- Realistic skill development timelines

Your mission is to provide detailed, actionable skill gap analysis that serves as the foundation for personalized development planning.

ANALYSIS FRAMEWORK:
You must conduct thorough analysis across multiple skill dimensions:
1. Technical Skills: Programming languages, frameworks, tools, technologies
2. Domain Knowledge: Industry expertise, business acumen, specialized knowledge
3. Soft Skills: Communication, leadership, collaboration, problem-solving
4. Methodological Skills: Processes, frameworks, best practices, workflows

PROFICIENCY ASSESSMENT SCALE (0-5):
- 0: No knowledge or exposure
- 1: Awareness level - basic familiarity, requires significant guidance
- 2: Novice level - can perform basic tasks with supervision
- 3: Intermediate level - can work independently on standard tasks  
- 4: Advanced level - can handle complex scenarios, mentor others
- 5: Expert level - deep mastery, innovation capability, thought leadership

IMPORTANCE CLASSIFICATION:
- CRITICAL: Absolutely essential for role success, often prerequisites
- HIGH: Very important for effective performance, directly impacts results
- MEDIUM: Important but can be developed in parallel, enhances performance  
- LOW: Nice-to-have, optional enhancements, future growth areas

STRATEGIC ANALYSIS REQUIREMENTS:
1. Identify ALL existing skills and accurately assess proficiency levels
2. Map ALL skills required for target role with required proficiency
3. Calculate skill gaps and learning effort required
4. Prioritize development based on importance and current competency
5. Group related skills for efficient learning paths
6. Consider realistic development timelines and dependencies
7. Account for experience level and learning capacity

OUTPUT SPECIFICATIONS:
- Comprehensive skill inventory (current vs. required)
- Detailed gap analysis with specific metrics
- Prioritized learning recommendations
- Strategic development roadmap overview
- Clear foundation for OKR and task generation

Your analysis will directly inform goal setting and task generation for a 6-month development plan.
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
🎯 MISSION: Conduct comprehensive skill gap analysis for career development planning.

👤 PROFILE ANALYSIS:
📍 CURRENT ROLE: ${userProfile.currentRole}
🎯 TARGET ROLE: ${userProfile.targetRole}  
📅 EXPERIENCE: ${userProfile.yearsExperience || 'Not specified'} years
💼 CURRENT SKILLS: ${userProfile.skills.join(', ')}
🎯 TARGET REQUIREMENTS: ${userProfile.targetSkills.join(', ')}

⚠️ ANALYSIS REQUIREMENTS:
1. ✅ Comprehensive skill inventory (current vs. target)
2. ✅ Detailed gap analysis with proficiency metrics  
3. ✅ Strategic importance assessment
4. ✅ Prioritized learning recommendations
5. ✅ Grouped skill clusters for efficient development

📊 PROFICIENCY SCALE (0-5):
- 0: No knowledge/exposure
- 1: Awareness level (needs significant guidance)
- 2: Novice level (basic tasks with supervision) 
- 3: Intermediate level (independent standard work)
- 4: Advanced level (complex scenarios, mentoring capability)
- 5: Expert level (mastery, innovation, thought leadership)

🔥 IMPORTANCE CLASSIFICATION:
- CRITICAL: Essential for role success, often prerequisites
- HIGH: Very important for performance, direct impact  
- MEDIUM: Important but parallel development possible
- LOW: Nice-to-have, optional enhancements

📋 SKILL CATEGORIES TO ANALYZE:
1. 💻 TECHNICAL: Programming languages, frameworks, tools, technologies
2. 🏢 DOMAIN: Industry knowledge, business acumen, specialized expertise  
3. 🤝 SOFT SKILLS: Communication, leadership, collaboration, problem-solving
4. 📐 METHODOLOGICAL: Processes, frameworks, best practices, workflows

🎯 REQUIRED OUTPUT FORMAT:
{
  "currentSkills": [
    "List of all current skills identified"
  ],
  "targetSkills": [
    "List of all skills required for target role"
  ],
  "gaps": [
    {
      "skill": "Specific skill name",
      "importance": "critical|high|medium|low",
      "currentLevel": 0-5,
      "targetLevel": 0-5
    }
  ],
  "prioritizedGaps": [
    "List of skills in learning priority order (most critical first)"
  ],
  "summary": "Strategic analysis summary with key insights, learning priorities, and development recommendations"
}

🔍 ANALYSIS STRATEGY:
- Start with CRITICAL skills that are prerequisites
- Identify HIGH impact skills for immediate performance  
- Group related skills for efficient learning paths
- Consider realistic development timelines
- Account for experience level and learning capacity
- Highlight dependencies between skills

✅ VALIDATION CHECKLIST:
□ All mentioned skills categorized and assessed
□ Importance levels align with industry standards
□ Proficiency gaps are realistic and achievable
□ Priority order enables effective learning progression  
□ Summary provides actionable insights
□ Output supports downstream OKR generation

🚨 CRITICAL: This analysis feeds directly into OKR creation and 180-task generation. Ensure comprehensive and accurate assessment.
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
