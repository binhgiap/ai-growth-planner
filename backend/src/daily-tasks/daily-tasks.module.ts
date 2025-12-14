import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyTask } from './entities/daily-task.entity';
import { DailyTaskService } from './daily-tasks.service';
import { DailyTaskController } from './daily-tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailyTask])],
  controllers: [DailyTaskController],
  providers: [DailyTaskService],
  exports: [DailyTaskService],
})
export class DailyTasksModule {}
