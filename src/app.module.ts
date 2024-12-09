import { Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { databaseConfig } from './configs/db.config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/globalException.filter';
import * as redisStore from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from './modules/email/email.module';
import { TokenModule } from './modules/token/token.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { TransformInterceptor } from './interceptors/apiResponse.interceptor';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { EventModule } from './modules/event/event.module';
import { EventInfoModule } from './modules/eventInfo/eventInfo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision', 'staging')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
      validationOptions: {
        abortEarly: false,
      },
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      load: [databaseConfig],
      cache: true,
      expandVariables: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore.redisStore,
      socket: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    EmailModule,
    TokenModule,
    TicketModule,
    EventModule,
    EventInfoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    Logger,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
