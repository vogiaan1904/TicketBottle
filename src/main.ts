import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configSwagger } from './configs/apiDocs.config';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);

  const app = await NestFactory.create(AppModule);
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
