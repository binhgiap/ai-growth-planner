import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from '../providers/openai.provider';

interface HRReport {
  executiveSummary: string;
  strengths: string[];
  areasOfImprovement: string[];
  achievements: string[];
  completionMetrics: {
    goalsCompletion: number;
    taskCompletion: number;
    skillsAcquired: number;
  };
  recommendations: {
    forManager: string[];
    forEmployee: string[];
    forOrganization: string[];
  };
  nextPhase: string;
}

/**
 * HRReportAgent generates comprehensive HR reports and recommendations
 */
@Injectable()
export class HRReportAgent {
  private systemPrompt = `
You are an expert HR analyst and executive coach specializing in employee development reports.
Your task is to generate comprehensive reports suitable for HR review and strategic planning.
Return structured JSON with professional insights and recommendations.
Format: {
  "executiveSummary": "",
  "strengths": [],
  "areasOfImprovement": [],
  "achievements": [],
  "completionMetrics": {
    "goalsCompletion": number,
    "taskCompletion": number,
    "skillsAcquired": number
  },
  "recommendations": {
    "forManager": [],
    "forEmployee": [],
    "forOrganization": []
  },
  "nextPhase": ""
}
  `;

  constructor(private openaiProvider: OpenAIProvider) {}

  /**
   * Generate comprehensive 6-month report
   */
  async generateFinalReport(reportData: {
    employee: {
      name: string;
      role: string;
      targetRole: string;
      yearsExperience: number;
    };
    progress: {
      goalsCompletion: number;
      taskCompletion: number;
      skillsAcquired: string[];
      strengthsIdentified: string[];
      areasOfConcern: string[];
      achievements: string[];
    };
    metrics: {
      consistencyScore: number;
      qualityScore: number;
      adaptabilityScore: number;
      leadershipScore: number;
    };
  }): Promise<HRReport> {
    const userMessage = `
Generate a comprehensive 6-month development report for HR review.

Employee Profile:
- Name: ${reportData.employee.name}
- Current Role: ${reportData.employee.role}
- Target Role: ${reportData.employee.targetRole}
- Years of Experience: ${reportData.employee.yearsExperience}

Performance Data:
- Goals Completion: ${reportData.progress.goalsCompletion}%
- Task Completion: ${reportData.progress.taskCompletion}%
- Skills Acquired: ${reportData.progress.skillsAcquired.join(', ')}
- Strengths: ${reportData.progress.strengthsIdentified.join(', ')}
- Areas of Concern: ${reportData.progress.areasOfConcern.join(', ')}
- Achievements: ${reportData.progress.achievements.join(', ')}

Behavioral Metrics:
- Consistency Score: ${reportData.metrics.consistencyScore}/10
- Quality Score: ${reportData.metrics.qualityScore}/10
- Adaptability Score: ${reportData.metrics.adaptabilityScore}/10
- Leadership Score: ${reportData.metrics.leadershipScore}/10

Provide insights on:
1. Overall performance and development
2. Readiness for next role
3. Specific recommendations for continued growth
4. Support needed from manager and organization
5. Next phase of development plan
    `;

    return this.openaiProvider.generateJSON<HRReport>(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Generate promotion readiness assessment
   */
  async assessPromotionReadiness(assessmentData: {
    currentRole: string;
    targetRole: string;
    metrics: any;
    feedback: string;
  }): Promise<any> {
    const userMessage = `
Assess promotion readiness for this employee:
- Current Role: ${assessmentData.currentRole}
- Target Role: ${assessmentData.targetRole}
- Performance Metrics: ${JSON.stringify(assessmentData.metrics)}
- Manager Feedback: ${assessmentData.feedback}

Provide:
1. Readiness assessment (0-100%)
2. Key strengths for the new role
3. Development gaps to address
4. Timeline for promotion readiness
5. Support plan for transition
    `;

    return this.openaiProvider.generateJSON<any>(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Generate next phase recommendations
   */
  async generateNextPhaseRecommendations(
    currentPhaseData: any,
  ): Promise<string> {
    const userMessage = `
Based on the completion of this development phase:
${JSON.stringify(currentPhaseData, null, 2)}

Create a detailed recommendation for the next phase including:
1. Priority areas for continued development
2. New skills to focus on
3. Mentorship or coaching recommendations
4. Timeline for next phase
5. Success metrics for next phase
    `;

    return this.openaiProvider.generateCompletion(
      this.systemPrompt,
      userMessage,
    );
  }

  /**
   * Generate team-level insights
   */
  async generateTeamInsights(teamData: any[]): Promise<any> {
    const userMessage = `
Analyze team development data and provide organizational insights:
${JSON.stringify(teamData, null, 2)}

Include:
1. Team-wide strengths and gaps
2. Hiring and training recommendations
3. Team capability forecast
4. Succession planning insights
5. Organizational development strategy
    `;

    return this.openaiProvider.generateJSON<any>(
      this.systemPrompt,
      userMessage,
    );
  }
}
