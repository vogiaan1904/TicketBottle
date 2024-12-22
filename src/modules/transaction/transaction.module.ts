import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BullModule } from '@nestjs/bullmq';
import { TransactionQueue } from './enum/queue';
import { ProcessTransactionWorker } from './worker/processTransaction.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TransactionQueue.name,
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, ProcessTransactionWorker],
  exports: [TransactionService],
})
export class TransactionModule {}
