import {
  BadRequestException,
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { configSwagger } from './configs/apiDocs.config';
import { instance } from './configs/winston.config';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  });
  app.setGlobalPrefix('api/v1');

  configSwagger(app);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const result =
          errors[0].constraints[Object.keys(errors[0].constraints)[0]];
        return new BadRequestException(result);
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(configService.get('PORT'), () => {
    logger.log(
      `Server running on http://localhost:${configService.get('PORT')}`,
    );
    logger.log(
      `API Docs http://localhost:${configService.get('PORT')}/api-docs`,
    );
  });
}
bootstrap();
