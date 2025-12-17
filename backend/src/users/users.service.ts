import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { User } from '@users/entities/user.entity';
import { NftMint } from '@nft-cron/entities/nft-mint.entity';
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
    @InjectRepository(NftMint)
    private nftMintRepository: Repository<NftMint>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email, deletedAt: IsNull() },
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
      relations: ['nfts'],
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
      where: { email: userData.email, deletedAt: IsNull() },
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
      relations: ['goals', 'dailyTasks', 'progressLogs', 'nfts'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      user: this.mapToDto(user),
      goals: user.goals || [],
      tasksCount: (user.dailyTasks || []).length,
      progressLogs: user.progressLogs || [],
      nfts: (user.nfts || [])
        .sort((a, b) => {
          if (!a.mintedAt && !b.mintedAt) return 0;
          if (!a.mintedAt) return 1;
          if (!b.mintedAt) return -1;
          return b.mintedAt.getTime() - a.mintedAt.getTime();
        })
        .map((nft) => ({
          tokenId: nft.tokenId,
          contractAddress: nft.contractAddress,
          txHash: nft.txHash,
          description: nft.description,
          userInfo: nft.userInfo,
          mintedAt: nft.mintedAt,
        })),
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
    const nfts =
      user?.nfts && user?.nfts.length > 0
        ? user.nfts.map((nft) => ({
            tokenId: nft.tokenId,
            contractAddress: nft.contractAddress,
            txHash: nft.txHash,
            description: nft.description,
            userInfo: nft.userInfo,
            mintedAt: nft.mintedAt,
          }))
        : [];
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
      nfts,
    };
  }

  /**
   * Get the top users by number of NFTs owned.
   * Used for the NFT holder leaderboard.
   */
  async getTopNftHolders(limit = 10): Promise<
    {
      id: string;
      name: string;
      email: string;
      department: string | null;
      profile: {
        role: string | null;
        currentLevel: string | null;
        dailyTime: number | null;
        targetGoal: string | null;
        targetLevel: string | null;
      };
      growthPlan: null;
      joinedAt: Date;
      lastActive: Date;
      nftCount: number;
      nfts: {
        tokenId: string | null;
        contractAddress: string;
        txHash: string;
        description: string;
        userInfo: string;
        mintedAt: Date | null;
      }[];
    }[]
  > {
    const qb = this.nftMintRepository
      .createQueryBuilder('nft')
      .innerJoin('nft.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.email', 'email')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.currentRole', 'currentRole')
      .addSelect('COUNT(nft.id)', 'nftCount')
      .groupBy('user.id')
      .addGroupBy('user.email')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .addGroupBy('user.currentRole')
      .orderBy('COUNT(nft.id)', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<{
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      currentRole: string | null;
      nftCount: string;
    }>();

    if (rows.length === 0) {
      return [];
    }

    const userIds = rows.map((row) => row.userId);
    const users = await this.usersRepository.find({
      where: { id: In(userIds), deletedAt: IsNull() },
      relations: ['nfts'],
    });

    const usersById = new Map(users.map((u) => [u.id, u]));

    return rows
      .map((row) => {
        const user = usersById.get(row.userId);
        if (!user) {
          return null;
        }

        const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
        const currentRole = user.currentRole ?? null;
        const targetRole = user.targetRole ?? null;
        const hoursPerWeek = user.hoursPerWeek ?? null;

        const nfts =
          (user.nfts || []).map((nft) => ({
            tokenId: nft.tokenId,
            contractAddress: nft.contractAddress,
            txHash: nft.txHash,
            description: nft.description,
            userInfo: nft.userInfo,
            mintedAt: nft.mintedAt,
          })) ?? [];

        return {
          id: user.id,
          name,
          email: user.email,
          department: currentRole,
          profile: {
            role: currentRole,
            currentLevel: currentRole,
            dailyTime:
              typeof hoursPerWeek === 'number' ? hoursPerWeek / 7 : null,
            targetGoal: targetRole,
            targetLevel: targetRole,
          },
          growthPlan: null,
          joinedAt: user.createdAt,
          lastActive: user.createdAt,
          nftCount: Number(row.nftCount),
          nfts,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
