import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { logger } from '../configs/winston.config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Log the exception details
    logger.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message:
        exception instanceof Error
          ? exception.message
          : typeof message === 'string'
            ? message
            : JSON.stringify(message),
      stack: exception instanceof Error ? exception.stack : null,
    });

    console.error(exception);

    response.status(status).json({
      statusCode: status,
      message,
      error:
        this.configService.get('NODE_ENV') !== 'production'
          ? {
              response: exception.response,
              stack: exception.stack,
            }
          : null,
    });

    // Determine the response message based on environment and exception type
  }
}
