import { EmailService } from '@/modules/email/email.service';
import { OrderSuccessDataDto } from '@/modules/email/interfaces/payment/orderSuccess.interface';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailQueue } from '../enums/queue';

@Processor(EmailQueue.name, {
  concurrency: 5,
})
export class ProcessTransactionWorker extends WorkerHost {
  private readonly logger = new Logger(ProcessTransactionWorker.name);
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(
    job: Job<{ email: string; orderData: OrderSuccessDataDto }>,
  ): Promise<void> {
    const { email, orderData } = job.data;
    this.logger.log(`Sending success email for order ID: ${orderData.orderId}`);
    try {
      await this.emailService.sendOrderSuccessEmail(email, orderData);
    } catch (error) {
      this.logger.error(
        `Failed to send success email for orderId : ${orderData.orderId}`,
        error,
      );
      console.error(error);
      throw error;
    }
  }
}
