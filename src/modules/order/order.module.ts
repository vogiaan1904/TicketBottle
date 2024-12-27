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
import { EmailQueue, TicketQueue } from './enums/queue';
import { TransactionModule } from '../transaction/transaction.module';
import { EmailModule } from '../email/email.module';
import { SendSuccessOrderEmailWorker } from './workers/send-order-success-email.worker';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    TicketReleaseProcessor,
    ProcessTransactionWorker,
    SendSuccessOrderEmailWorker,
  ],
  exports: [OrderService],
  imports: [
    //ticket queue
    BullModule.registerQueue({
      name: TicketQueue.name,
    }),
    BullBoardModule.forFeature({
      name: TicketQueue.name,
      adapter: BullMQAdapter,
    }),

    //email queue
    BullModule.registerQueue({
      name: EmailQueue.name,
    }),
    BullBoardModule.forFeature({
      name: EmailQueue.name,
      adapter: BullMQAdapter,
    }),

    EventModule,
    TransactionModule,
    PaymentModule,
    EmailModule,
    UserModule,
  ],
})
export class OrderModule {}
