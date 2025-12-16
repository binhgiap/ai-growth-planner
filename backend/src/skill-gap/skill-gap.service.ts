import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SkillGap } from './skill-gap.entity';
import { CreateSkillGapDto, SkillGapResponseDto } from './skill-gap.dto';

/**
 * SkillGapService handles skill gap analysis storage and retrieval
 */
@Injectable()
export class SkillGapService {
  private logger = new Logger(SkillGapService.name);

  constructor(
    @InjectRepository(SkillGap)
    private skillGapRepository: Repository<SkillGap>,
  ) {}

  /**
   * Create and save a skill gap analysis
   */
  async create(
    userId: string,
    createSkillGapDto: CreateSkillGapDto,
  ): Promise<SkillGapResponseDto> {
    const skillGap = this.skillGapRepository.create({
      user_id: userId,
      current_level: createSkillGapDto.currentLevel,
      target_level: createSkillGapDto.targetLevel,
      current_skills: createSkillGapDto.currentSkills,
      target_skills: createSkillGapDto.targetSkills,
      gaps: createSkillGapDto.gaps,
      prioritized_gaps: createSkillGapDto.prioritizedGaps,
      summary: createSkillGapDto.summary,
      total_gap_count: createSkillGapDto.gaps.length,
    });

    const savedSkillGap = await this.skillGapRepository.save(skillGap);
    this.logger.log(
      `Skill gap analysis saved for user ${userId} with ID ${savedSkillGap.id}`,
    );
    return this.mapToDto(savedSkillGap);
  }

  /**
   * Get the latest skill gap analysis for a user
   */
  async findLatestByUserId(
    userId: string,
  ): Promise<SkillGapResponseDto | null> {
    const skillGap = await this.skillGapRepository.findOne({
      where: { user_id: userId, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });

    if (!skillGap) {
      return null;
    }

    return this.mapToDto(skillGap);
  }

  /**
   * Get all skill gap analyses for a user
   */
  async findByUserId(userId: string): Promise<SkillGapResponseDto[]> {
    const skillGaps = await this.skillGapRepository.find({
      where: { user_id: userId, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });

    return skillGaps.map((sg) => this.mapToDto(sg));
  }

  /**
   * Map entity to DTO
   */
  private mapToDto(skillGap: SkillGap): SkillGapResponseDto {
    return {
      id: skillGap.id,
      userId: skillGap.user_id,
      currentLevel: skillGap.current_level,
      targetLevel: skillGap.target_level,
      currentSkills: skillGap.current_skills,
      targetSkills: skillGap.target_skills,
      gaps: skillGap.gaps,
      prioritizedGaps: skillGap.prioritized_gaps,
      summary: skillGap.summary,
      totalGapCount: skillGap.total_gap_count,
      createdAt: skillGap.created_at,
      updatedAt: skillGap.updated_at,
    };
  }
}
