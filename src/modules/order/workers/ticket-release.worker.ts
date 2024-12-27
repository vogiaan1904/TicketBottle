import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrderService } from '../order.service';
import { TicketQueue } from '../enums/queue';

@Processor(TicketQueue.name)
export class TicketReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketReleaseProcessor.name);
  constructor(private readonly orderService: OrderService) {
    super();
  }

  async process(job: Job<{ orderCode: string }>): Promise<void> {
    const { orderCode } = job.data;
    this.logger.log(`Processing releaseTickets job for order Id: ${orderCode}`);
    try {
      this.logger.log(`Cancelling order: ${orderCode}`);
      await this.orderService.cancelOrder(orderCode);
      this.logger.log(
        `Successfully released tickets for order Id: ${orderCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to release tickets for order Id: ${orderCode}`,
        error,
      );
      console.error(error);
    }
  }
}
