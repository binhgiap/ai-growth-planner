import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Goal } from '@goals/entities/goal.entity';
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalResponseDto,
} from '@goals/dto/create-goal.dto';

/**
 * GoalService handles OKR (Objectives & Key Results) management
 */
@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
  ) {}

  /**
   * Create a new goal
   */
  async create(
    userId: string,
    createGoalDto: CreateGoalDto,
  ): Promise<GoalResponseDto> {
    if (createGoalDto.targetDate <= createGoalDto.startDate) {
      throw new BadRequestException('Target date must be after start date');
    }

    const goal = this.goalsRepository.create({
      ...createGoalDto,
      user_id: userId,
      status: 'NOT_STARTED',
      progress: 0,
    });

    const savedGoal = await this.goalsRepository.save(goal);
    return this.mapToDto(savedGoal);
  }

  /**
   * Get all goals for a user
   */
  async findByUserId(
    userId: string,
    status?: string,
  ): Promise<GoalResponseDto[]> {
    const query = this.goalsRepository
      .createQueryBuilder('goal')
      .where('goal.user_id = :userId', { userId })
      .andWhere('goal.deletedAt IS NULL');

    if (status) {
      query.andWhere('goal.status = :status', { status });
    }

    query.orderBy('goal.priority', 'ASC');
    query.addOrderBy('goal.createdAt', 'DESC');

    const goals = await query.getMany();
    return goals.map((goal) => this.mapToDto(goal));
  }

  /**
   * Get goal by ID
   */
  async findById(id: string, userId: string): Promise<GoalResponseDto> {
    const goal = await this.goalsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
      relations: ['tasks'],
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return this.mapToDto(goal);
  }

  /**
   * Update goal
   */
  async update(
    id: string,
    userId: string,
    updateGoalDto: UpdateGoalDto,
  ): Promise<GoalResponseDto> {
    const goal = await this.goalsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    Object.assign(goal, updateGoalDto);
    const updatedGoal = await this.goalsRepository.save(goal);
    return this.mapToDto(updatedGoal);
  }

  /**
   * Delete goal (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const goal = await this.goalsRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    goal.deletedAt = new Date();
    await this.goalsRepository.save(goal);
  }

  /**
   * Get goals by type (OBJECTIVE or KEY_RESULT)
   */
  async findByType(userId: string, type: string): Promise<GoalResponseDto[]> {
    const goals = await this.goalsRepository.find({
      where: { user_id: userId, type, deletedAt: IsNull() },
      order: { priority: 'ASC' },
    });

    return goals.map((goal) => this.mapToDto(goal));
  }

  /**
   * Calculate overall goal progress
   */
  async getOverallProgress(userId: string): Promise<number> {
    const goals = await this.goalsRepository.find({
      where: { user_id: userId, deletedAt: IsNull() },
    });

    if (goals.length === 0) return 0;

    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  }

  /**
   * Get goals that are COMPLETED and not yet minted as NFT
   */
  async findCompletedNotMinted(userId?: string): Promise<GoalResponseDto[]> {
    const query = this.goalsRepository
      .createQueryBuilder('goal')
      .where('goal.status = :status', { status: 'COMPLETED' })
      .andWhere('goal.isMintedNft = :minted', { minted: false })
      .andWhere('goal.deletedAt IS NULL');

    if (userId) {
      query.andWhere('goal.user_id = :userId', { userId });
    }

    query.orderBy('goal.priority', 'ASC');

    const goals = await query.getMany();
    return goals.map((goal) => this.mapToDto(goal));
  }

  /**
   * Map Goal entity to DTO
   */
  private mapToDto(goal: Goal): GoalResponseDto {
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      type: goal.type,
      progress: goal.progress,
      status: goal.status,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      priority: goal.priority,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}
