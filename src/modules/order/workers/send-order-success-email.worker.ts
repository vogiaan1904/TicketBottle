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
    job: Job<{
      email: string;
      orderData: OrderSuccessDataDto;
      attachments: any[];
    }>,
  ): Promise<void> {
    const { email, orderData, attachments } = job.data;
    this.logger.log(
      `Sending email for success order code: ${orderData.orderCode}...`,
    );
    try {
      await this.emailService.sendSuccessOrderEmail(
        email,
        orderData,
        attachments,
      );
      this.logger.log(
        `Successfully sent email for order code: ${orderData.orderCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email for success order code : ${orderData.orderCode}`,
        error,
      );
      console.error(error);
      throw error;
    }
  }
}
