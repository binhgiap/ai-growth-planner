import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * GlobalExceptionFilter handles all exceptions and converts them to structured JSON responses
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const requestObj = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: unknown = null;

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const respObj = exceptionResponse as Record<string, unknown>;
        message = (respObj.message as string) ?? exception.message;
        error = exceptionResponse;
      } else {
        message = String(exceptionResponse);
      }
    } else if (exception instanceof Error) {
      // Handle standard Error objects
      message = exception.message;
      error = {
        name: exception.name,
        message: exception.message,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Log the exception
    const method = String(requestObj.method ?? 'UNKNOWN');
    const url = String(requestObj.url ?? 'UNKNOWN');
    this.logger.error(
      `${method} ${url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Send structured error response
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      message,
      error,
    });
  }
}
