import {
  IsEmail,
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@users/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Current job role',
  })
  @IsString()
  currentRole: string;

  @ApiProperty({
    example: 'Senior Engineer',
    description: 'Target job role for 6-month plan',
  })
  @IsString()
  targetRole: string;

  @ApiPropertyOptional({
    example: ['JavaScript', 'TypeScript', 'React'],
    isArray: true,
    description: 'Current skills',
  })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    example: ['System Design', 'Leadership', 'Architecture'],
    isArray: true,
    description: 'Target skills to develop',
  })
  @IsArray()
  @IsOptional()
  targetSkills?: string[];

  @ApiPropertyOptional({
    example: 40,
    description: 'Hours per week available for learning',
  })
  @IsNumber()
  @IsOptional()
  hoursPerWeek?: number;

  @ApiPropertyOptional({
    example: 'Passionate about building scalable systems',
    description: 'User bio/about information',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: 'Senior Software Engineer',
    description: 'Current job role',
  })
  @IsString()
  @IsOptional()
  currentRole?: string;

  @ApiPropertyOptional({
    example: 'Staff Engineer',
    description: 'Target job role',
  })
  @IsString()
  @IsOptional()
  targetRole?: string;

  @ApiPropertyOptional({
    example: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    isArray: true,
    description: 'Current skills',
  })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    example: ['System Design', 'Leadership', 'DevOps'],
    isArray: true,
    description: 'Target skills to develop',
  })
  @IsArray()
  @IsOptional()
  targetSkills?: string[];

  @ApiPropertyOptional({
    example: 45,
    description: 'Hours per week available for learning',
  })
  @IsNumber()
  @IsOptional()
  hoursPerWeek?: number;

  @ApiPropertyOptional({
    example: 'Updated bio',
    description: 'User bio/about information',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role (admin or user)',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'User account status',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '0x1234567890123456789012345678901234567890',
    description: 'User wallet address used for NFT minting',
  })
  @IsString()
  @IsOptional()
  walletAddress?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  targetRole: string;
  skills: string[];
  targetSkills: string[];
  hoursPerWeek: number;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
  nfts?: {
    tokenId: string | null;
    contractAddress: string;
    txHash: string;
    description: string;
    userInfo: string;
    mintedAt: Date | null;
  }[];
}
