import { Module } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { AIAgentsModule } from '../ai-agents/ai-agents.module';
import { UsersModule } from '../users/users.module';
import { GoalsModule } from '../goals/goals.module';
import { DailyTasksModule } from '../daily-tasks/daily-tasks.module';

@Module({
  imports: [AIAgentsModule, UsersModule, GoalsModule, DailyTasksModule],
  controllers: [PlanningController],
  providers: [PlanningService],
  exports: [PlanningService],
})
export class PlanningModule {}
