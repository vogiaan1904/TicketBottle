import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-yet';
import * as Joi from 'joi';
import { WinstonModule } from 'nest-winston';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './configs/db.config';
import { logger } from './configs/winston.config';
import { GlobalExceptionFilter } from './filters/globalException.filter';
import { TransformInterceptor } from './interceptors/apiResponse.interceptor';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { EmailModule } from './modules/email/email.module';
import { EventInfoModule } from './modules/event-info/event-info.module';
import { EventModule } from './modules/event/event.module';
import { ImageModule } from './modules/image/image.module';
import { OrderDetailModule } from './modules/order-detail/order-detail.module';
import { OrderModule } from './modules/order/order.module';
import { OrganizerModule } from './modules/organizer/organizer.module';
import { PaymentModule } from './modules/payment/payment.module';
import { StaffModule } from './modules/staff/staff.module';
import { TicketClassModule } from './modules/ticket-class/ticket-class.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { TokenModule } from './modules/token/token.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision', 'staging')
          .default('development'),
        PORT: Joi.number().default(3000),
        REDIS_CACHE_URL: Joi.string().uri().required(),
        REDIS_CORE_URL: Joi.string().uri().required(),
        NGROK_TEST_URL: Joi.string().uri().required(),
        //...
      }),
      validationOptions: {
        abortEarly: false,
      },
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.dev'
          : process.env.NODE_ENV === 'test'
            ? '.env.test'
            : '.env.dev',
      load: [databaseConfig],
      cache: true,
      expandVariables: true,
    }),
    WinstonModule.forRoot({
      instance: logger,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const cacheUrl = configService.get<string>('REDIS_CACHE_URL');
        return {
          store: redisStore.redisStore,
          url: cacheUrl,
          ttl: 3600,
          connectTimeout: 10000,
          // password: configService.get<string>('REDIS_PASSWORD') || undefined,
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'single',
          url: configService.get<string>('REDIS_CORE_URL') + '?family=0',
          // password: configService.get<string>('REDIS_PASSWORD') || undefined,
          options: {
            connectTimeout: 5000,
            maxRetriesPerRequest: 3,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        console.log('BullModule REDIS_HOST:', host);
        return {
          connection: {
            family: 0,
            host: host,
            port: configService.get<number>('REDIS_CORE_PORT'),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    MeiliSearchModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const meiliSearchHost = configService.get<string>('MEILISEARCH_HOST');
        const meiliSearchApiKey = configService.get<string>(
          'MEILISEARCH_MASTER_KEY',
        );
        return {
          host: meiliSearchHost,
          apiKey: meiliSearchApiKey,
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    EmailModule,
    TokenModule,
    TicketModule,
    EventModule,
    EventInfoModule,
    TicketClassModule,
    StaffModule,
    OrderModule,
    OrderDetailModule,
    PaymentModule,
    TransactionModule,
    OrganizerModule,
    ImageModule,
    CategoryModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
