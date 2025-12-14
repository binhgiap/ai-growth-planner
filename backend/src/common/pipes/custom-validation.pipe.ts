import {
  Injectable,
  BadRequestException,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * CustomValidationPipe extends NestJS ValidationPipe with custom error formatting
 */
@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    const options: ValidationPipeOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error) => {
          if (error.constraints) {
            return {
              field: error.property,
              errors: Object.values(error.constraints),
            };
          }
          return {
            field: error.property,
            errors: ['Invalid value'],
          };
        });

        return new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    };

    super(options);
  }
}
