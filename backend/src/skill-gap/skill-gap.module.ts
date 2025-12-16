import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillGap } from './skill-gap.entity';
import { SkillGapService } from './skill-gap.service';

@Module({
  imports: [TypeOrmModule.forFeature([SkillGap])],
  providers: [SkillGapService],
  exports: [SkillGapService],
})
export class SkillGapModule {}
