import { EmailService } from '@/modules/email/email.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailQueue } from '../enums/queue';
import { OrderSuccessDataDto } from '../interfaces/order-email-data.interface';

@Processor(EmailQueue.name, {
  concurrency: 5,
})
export class SendSuccessOrderEmailWorker extends WorkerHost {
  private readonly logger = new Logger(SendSuccessOrderEmailWorker.name);
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(
    job: Job<{ email: string; orderData: OrderSuccessDataDto }>,
  ): Promise<void> {
    const { email, orderData } = job.data;
    this.logger.log(`Sending email for success order Id: ${orderData.orderId}`);
    try {
      await this.emailService.sendSuccessOrderEmail(email, orderData);
      this.logger.log(
        `Successfully sent email for order Id: ${orderData.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email for success order Id : ${orderData.orderId}`,
        error,
      );
      console.error(error);
      throw error;
    }
  }
}
