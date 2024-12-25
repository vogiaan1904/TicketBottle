import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { PaymentModule } from '../payment/payment.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TicketReleaseProcessor } from './workers/ticket-release.worker';
import { ProcessTransactionWorker } from './workers/process-transaction.worker';
import { TicketQueue } from './enums/queue';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, TicketReleaseProcessor, ProcessTransactionWorker],
  exports: [OrderService],
  imports: [
    //ticket
    EventModule,
    BullModule.registerQueue({
      name: TicketQueue.name,
    }),
    BullBoardModule.forFeature({
      name: TicketQueue.name,
      adapter: BullMQAdapter,
    }),
    TransactionModule,
    PaymentModule,
  ],
})
export class OrderModule {}
