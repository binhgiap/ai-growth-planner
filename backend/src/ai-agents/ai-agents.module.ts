import { Module } from '@nestjs/common';
import { AIProvider } from './providers/ai.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { SkillGapAgent } from './agents/skill-gap.agent';
import { GoalPlannerAgent } from './agents/goal-planner.agent';
import { DailyTaskAgent } from './agents/daily-task.agent';
import { ProgressTrackerAgent } from './agents/progress-tracker.agent';
import { HRReportAgent } from './agents/hr-report.agent';
import { AgentOrchestrationService } from './services/agent-orchestration.service';

@Module({
  providers: [
    AIProvider,
    OpenAIProvider,
    SkillGapAgent,
    GoalPlannerAgent,
    DailyTaskAgent,
    ProgressTrackerAgent,
    HRReportAgent,
    AgentOrchestrationService,
  ],
  exports: [
    AIProvider,
    OpenAIProvider,
    SkillGapAgent,
    GoalPlannerAgent,
    DailyTaskAgent,
    ProgressTrackerAgent,
    HRReportAgent,
    AgentOrchestrationService,
  ],
})
export class AIAgentsModule {}
