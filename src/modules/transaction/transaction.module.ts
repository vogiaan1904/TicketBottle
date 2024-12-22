import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BullModule } from '@nestjs/bullmq';
import { TransactionQueue } from './enum/queue';
import { ProcessTransactionWorker } from './worker/processTransaction.worker';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TransactionQueue.name,
    }),
    BullBoardModule.forFeature({
      name: TransactionQueue.name,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, ProcessTransactionWorker],
  exports: [TransactionService],
})
export class TransactionModule {}
