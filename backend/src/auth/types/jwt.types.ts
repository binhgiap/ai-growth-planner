import { JwtPayload as JwtPayloadInterface } from '@auth/strategies/jwt.strategy';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadInterface;
    }
  }
}
