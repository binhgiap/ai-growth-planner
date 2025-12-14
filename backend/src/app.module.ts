import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';

// Modules
import { UsersModule } from './users/users.module';
import { GoalsModule } from './goals/goals.module';
import { DailyTasksModule } from './daily-tasks/daily-tasks.module';
import { ProgressTrackingModule } from './progress-tracking/progress-tracking.module';
import { ReportsModule } from './reports/reports.module';
import { AIAgentsModule } from './ai-agents/ai-agents.module';
import { PlanningModule } from './planning/planning.module';

// Entities
import { User } from './users/entities/user.entity';
import { Goal } from './goals/entities/goal.entity';
import { DailyTask } from './daily-tasks/entities/daily-task.entity';
import { ProgressLog } from './progress-tracking/entities/progress-log.entity';
import { Report } from './reports/entities/report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      entities: [User, Goal, DailyTask, ProgressLog, Report],
    }),
    UsersModule,
    GoalsModule,
    DailyTasksModule,
    ProgressTrackingModule,
    ReportsModule,
    AIAgentsModule,
    PlanningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
