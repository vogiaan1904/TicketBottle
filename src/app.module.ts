import { Module } from '@nestjs/common';
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
        host: 'localhost',
        port: 6379,
      },
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    EmailModule,
    TokenModule,
    TicketModule,
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
  ],
})
export class AppModule {}
