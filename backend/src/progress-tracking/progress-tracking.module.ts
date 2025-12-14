import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressLog } from './entities/progress-log.entity';
import { ProgressTrackingService } from './progress-tracking.service';
import { ProgressTrackingController } from './progress-tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressLog])],
  controllers: [ProgressTrackingController],
  providers: [ProgressTrackingService],
  exports: [ProgressTrackingService],
})
export class ProgressTrackingModule {}
