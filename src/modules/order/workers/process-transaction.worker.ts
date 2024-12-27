import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrderService } from '../order.service';
import { TransactionQueue } from '@/modules/payment/enums/queue';

@Processor(TransactionQueue.name, {
  concurrency: 5,
})
export class ProcessTransactionWorker extends WorkerHost {
  private readonly logger = new Logger(ProcessTransactionWorker.name);
  constructor(private readonly orderService: OrderService) {
    super();
  }

  async process(job: Job<{ transactionID: string }>): Promise<void> {
    const { transactionID } = job.data;

    this.logger.log(`Processing transaction Id: ${transactionID}`);
    try {
      // process transaction
      await this.orderService.processTransaction(transactionID);
      this.logger.log(
        `Successfully processed transaction Id: ${transactionID}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process transaction Id: ${transactionID}`,
        error,
      );
      console.error(error);
      throw error;
    }
  }
}
