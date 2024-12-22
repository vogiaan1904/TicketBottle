import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { OrderController } from './order.controller';
import { OrderService, ticketQueue } from './order.service';
import { TicketReleaseProcessor } from './workers/ticket-release.processor';
import { VnpayModule } from 'nestjs-vnpay';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ignoreLogger } from 'vnpay';
import { PaymentModule } from '../payment/payment.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, TicketReleaseProcessor],
  exports: [OrderService],
  imports: [
    EventModule,
    BullModule.registerQueue({
      name: ticketQueue.name,
    }),
    PaymentModule,
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secureSecret: configService.getOrThrow<string>('VNP_SECURE_SECRET'),
        tmnCode: configService.getOrThrow<string>('VNP_TMN_CODE'),
        loggerFn: ignoreLogger,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class OrderModule {}
