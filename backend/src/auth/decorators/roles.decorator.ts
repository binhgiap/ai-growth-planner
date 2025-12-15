import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for an endpoint
 * Usage: @Roles(UserRole.ADMIN) or @Roles(UserRole.ADMIN, UserRole.MANAGER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
