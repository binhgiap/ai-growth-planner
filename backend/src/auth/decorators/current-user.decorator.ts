import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@auth/strategies/jwt.strategy';

/**
 * Custom decorator to extract user from request
 * Usage: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
