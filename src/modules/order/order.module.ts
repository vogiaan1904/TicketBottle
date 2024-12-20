import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { OrderController } from './order.controller';
import { OrderService, ticketQueue } from './order.service';
import { TicketReleaseProcessor } from './workers/ticket-release.processor';

@Module({
  controllers: [OrderController],
  providers: [OrderService, TicketReleaseProcessor],
  exports: [OrderService],
  imports: [
    EventModule,
    BullModule.registerQueue({
      name: ticketQueue.name,
    }),
  ],
})
export class OrderModule {}
