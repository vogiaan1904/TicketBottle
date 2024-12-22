import { Processor, WorkerHost } from '@nestjs/bullmq';
import { TransactionQueue } from '../enum/queue';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor(TransactionQueue.name)
export class ProcessTransactionWorker extends WorkerHost {
  private readonly logger = new Logger(ProcessTransactionWorker.name);

  consturctor() {}

  async process(job: Job<{ transactionID: string }>): Promise<void> {
    const { transactionID } = job.data;
    this.logger.log(`Processing transaction ID: ${transactionID}`);
    try {
      // process transaction
      this.logger.log(`Do something with trans: ${transactionID}`);
    } catch (error) {
      this.logger.error(
        `Failed to process transaction ID: ${transactionID}`,
        error,
      );
      console.error(error);
      throw error;
    }
  }
}
