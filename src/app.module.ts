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
            : '.env',
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
      useFactory: async (configService: ConfigService) => ({
        store: redisStore.redisStore,
        url: configService.get<string>('REDIS_CACHE_URL'),
        ttl: 3600,
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_CORE_URL'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const coreRedisUrl = configService.get<string>('REDIS_CORE_URL');
        const parsedUrl = new URL(coreRedisUrl);

        return {
          connection: {
            host: parsedUrl.hostname,
            port: parseInt(parsedUrl.port, 10),
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
          'MEILISEARCH_ADMIN_API_KEY',
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
