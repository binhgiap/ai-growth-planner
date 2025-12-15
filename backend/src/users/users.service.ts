import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '@users/entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@users/dto/create-user.dto';

/**
 * UserService handles all user-related business logic
 * Including profile management, skill tracking, and user preferences
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      skills: createUserDto.skills || [],
      targetSkills: createUserDto.targetSkills || [],
      hoursPerWeek: createUserDto.hoursPerWeek || 40,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.mapToDto(savedUser);
  }

  /**
   * Get all users (with pagination)
   */
  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: { deletedAt: IsNull() },
    });

    return {
      data: users.map((user) => this.mapToDto(user)),
      total,
    };
  }

  /**
   * Get user by ID (returns full entity)
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    return user || null;
  }

  /**
   * Get user profile DTO by ID
   */
  async findByIdDto(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['goals', 'dailyTasks', 'progressLogs', 'reports'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToDto(user);
  }

  /**
   * Get user by email (returns full entity with password for auth)
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });

    return user || null;
  }

  /**
   * Create a new user with password (for auth)
   */
  async createWithPassword(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currentRole?: string;
    targetRole?: string;
  }): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = this.usersRepository.create({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      currentRole: userData.currentRole,
      targetRole: userData.targetRole,
      skills: [],
      targetSkills: [],
      hoursPerWeek: 40,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Update password
   */
  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.password = hashedPassword;
    await this.usersRepository.save(user);
  }

  /**
   * Update user profile
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Merge the update data with existing user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    return this.mapToDto(updatedUser);
  }

  /**
   * Soft delete user
   */
  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.deletedAt = new Date();
    await this.usersRepository.save(user);
  }

  /**
   * Get user with full profile including goals, tasks, and progress
   */
  async getUserProfile(id: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['goals', 'dailyTasks', 'progressLogs'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      user: this.mapToDto(user),
      goals: user.goals || [],
      tasksCount: (user.dailyTasks || []).length,
      progressLogs: user.progressLogs || [],
    };
  }

  /**
   * Get user profile (DTO)
   */
  async getUserProfileDto(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['goals', 'dailyTasks', 'progressLogs', 'reports'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToDto(user);
  }

  /**
   * Map User entity to DTO
   */
  private mapToDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currentRole: user.currentRole,
      targetRole: user.targetRole,
      skills: user.skills || [],
      targetSkills: user.targetSkills || [],
      hoursPerWeek: user.hoursPerWeek,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
