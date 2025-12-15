import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;

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

  @ApiPropertyOptional({
    example: 'Software Engineer',
    description: 'Current job role',
  })
  @IsString()
  @IsOptional()
  currentRole?: string;

  @ApiPropertyOptional({
    example: 'Senior Engineer',
    description: 'Target job role',
  })
  @IsString()
  @IsOptional()
  targetRole?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password',
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: {
      id: 'uuid',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      createdAt: '2025-12-15T00:00:00Z',
    },
    description: 'User profile data',
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: Date;
  };
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
