import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { configSwagger } from './configs/apiDocs.config';
import { logger as winstonLogger } from './configs/winston.config';
import { GlobalExceptionFilter } from './filters/globalException.filter';

async function bootstrap() {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  process.on('uncaughtException', (error) => {
    winstonLogger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1); // Optional: Exit the process after logging
  });

  process.on('unhandledRejection', (reason, promise) => {
    winstonLogger.error('Unhandled Rejection at:', {
      promise,
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : null,
    });
    process.exit(1); // Optional: Exit the process after logging
  });
  try {
    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger({
        instance: winstonLogger,
      }),
      cors: true,
    });
    // app.setGlobalPrefix('api/v1');
    configSwagger(app);
    const configService = app.get(ConfigService);

    app.useGlobalFilters(new GlobalExceptionFilter(configService));
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          winstonLogger.error('Validation failed', {
            errors,
          });
          const result =
            errors[0].constraints[Object.keys(errors[0].constraints)[0]];

          return new BadRequestException(result);
        },
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    // app.enableCors({
    //   origin: '*',
    //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //   credentials: true,
    // });

    await app.listen(configService.get<number>('PORT'), () => {
      if (configService.get('NODE_ENV') !== 'production') {
        winstonLogger.info(
          `Server running on http://localhost:${configService.get('PORT')}`,
        );
        winstonLogger.info(
          `API Docs http://localhost:${configService.get('PORT')}/api-docs`,
        );
      } else {
        winstonLogger.info(`Server running on ${configService.get('HOST')}`);
        winstonLogger.info(`API Docs ${configService.get('HOST')}/api-docs`);
      }
    });
  } catch (error) {
    console.error(error);
    winstonLogger.error('Application bootstrap failed', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}
bootstrap();
