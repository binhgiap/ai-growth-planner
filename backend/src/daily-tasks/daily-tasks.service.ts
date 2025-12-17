import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { DailyTask } from './entities/daily-task.entity';
import {
  CreateDailyTaskDto,
  UpdateDailyTaskDto,
  DailyTaskResponseDto,
} from './dto/create-daily-task.dto';

/**
 * DailyTaskService handles daily task management
 * Converts goals into actionable daily tasks
 */
@Injectable()
export class DailyTaskService {
  constructor(
    @InjectRepository(DailyTask)
    private tasksRepository: Repository<DailyTask>,
  ) {}

  /**
   * Create a new daily task
   */
  async create(
    userId: string,
    createDailyTaskDto: CreateDailyTaskDto,
  ): Promise<DailyTaskResponseDto> {
    const task = this.tasksRepository.create({
      ...createDailyTaskDto,
      user_id: userId,
      status: 'TODO',
      completionPercentage: 0,
    });

    const savedTask = await this.tasksRepository.save(task);
    return this.mapToDto(savedTask);
  }

  /**
   * Get today's tasks for a user
   */
  async getTodaysTasks(userId: string): Promise<DailyTaskResponseDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await this.tasksRepository.find({
      where: {
        user_id: userId,
        dueDate: Between(today, tomorrow),
        deletedAt: IsNull(),
      },
      order: { priority: 'ASC', createdAt: 'DESC' },
    });

    return tasks.map((task) => this.mapToDto(task));
  }

  /**
   * Get tasks for a specific date range
   */
  async getTasksByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyTaskResponseDto[]> {
    const tasks = await this.tasksRepository.find({
      where: {
        user_id: userId,
        dueDate: Between(startDate, endDate),
        deletedAt: IsNull(),
      },
      order: { dueDate: 'ASC', priority: 'ASC' },
    });

    return tasks.map((task) => this.mapToDto(task));
  }

  /**
   * Get all tasks for a user (with optional status filter)
   */
  async findByUserId(
    userId: string,
    status?: string,
  ): Promise<DailyTaskResponseDto[]> {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.deletedAt IS NULL');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    query.orderBy('task.dueDate', 'ASC').addOrderBy('task.priority', 'ASC');

    const tasks = await query.getMany();
    return tasks.map((task) => this.mapToDto(task));
  }

  /**
   * Get tasks by goal
   */
  async getTasksByGoal(
    goalId: string,
    userId: string,
  ): Promise<DailyTaskResponseDto[]> {
    const tasks = await this.tasksRepository.find({
      where: {
        goal_id: goalId,
        user_id: userId,
        deletedAt: IsNull(),
      },
      order: { dueDate: 'ASC' },
    });

    return tasks.map((task) => this.mapToDto(task));
  }

  /**
   * Get task by ID
   */
  async findById(id: string, userId: string): Promise<DailyTaskResponseDto> {
    const task = await this.tasksRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.mapToDto(task);
  }

  /**
   * Update task
   */
  async update(
    id: string,
    userId: string,
    updateDailyTaskDto: UpdateDailyTaskDto,
  ): Promise<DailyTaskResponseDto> {
    const task = await this.tasksRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    Object.assign(task, updateDailyTaskDto);

    // If task is marked as COMPLETED, set completedAt
    if (updateDailyTaskDto.status === 'COMPLETED' && !task.completedAt) {
      task.completedAt = new Date();
      task.completionPercentage = 100;
    }

    const updatedTask = await this.tasksRepository.save(task);
    return this.mapToDto(updatedTask);
  }

  /**
   * Mark task as completed
   */
  async completeTask(
    id: string,
    userId: string,
  ): Promise<DailyTaskResponseDto> {
    const task = await this.tasksRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    task.status = 'COMPLETED';
    task.completionPercentage = 100;
    task.completedAt = new Date();

    const updatedTask = await this.tasksRepository.save(task);
    return this.mapToDto(updatedTask);
  }

  /**
   * Delete task (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: { id, user_id: userId, deletedAt: IsNull() },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    task.deletedAt = new Date();
    await this.tasksRepository.save(task);
  }

  /**
   * Get task completion stats for a user
   */
  async getCompletionStats(userId: string): Promise<any> {
    const tasks = await this.tasksRepository.find({
      where: { user_id: userId, deletedAt: IsNull() },
    });

    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      todo,
      completionPercentage:
        tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }

  /**
   * Delete all active tasks for a user (soft delete)
   * Used when cancelling a plan
   */
  async deleteAllActiveTasks(userId: string): Promise<number> {
    const now = new Date();
    const activeTasks = await this.tasksRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.dueDate > :now', { now })
      .andWhere('task.deletedAt IS NULL')
      .getMany();

    const deletedCount = activeTasks.length;

    // Soft delete all active tasks
    for (const task of activeTasks) {
      task.deletedAt = now;
      await this.tasksRepository.save(task);
    }

    return deletedCount;
  }

  /**
   * Map DailyTask entity to DTO
   */
  private mapToDto(task: DailyTask): DailyTaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      completionPercentage: task.completionPercentage,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
