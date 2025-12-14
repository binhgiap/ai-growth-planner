import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

/**
 * TransformInterceptor wraps all successful responses in a consistent JSON format
 * All responses follow the pattern: { success: true, data: {...}, message: "..." }
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const requestObj = ctx.getRequest();

    return next.handle().pipe(
      map((data: unknown) => {
        // If the data already has the response structure, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          const statusCode = (data as Record<string, unknown>)
            .statusCode as number;
          response.status(statusCode ?? HttpStatus.OK);
          return data;
        }

        // Otherwise, wrap it in the standard response format
        response.status(HttpStatus.OK);
        return {
          success: true,
          data: data ?? null,
          timestamp: new Date().toISOString(),
          path: String(requestObj.url ?? ''),
        };
      }),
    );
  }
}
