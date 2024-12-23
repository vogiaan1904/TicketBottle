import { InjectRedis } from '@nestjs-modules/ioredis';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Job } from 'bullmq';
import Redis from 'ioredis';
import { OrderService } from '../order.service';

@Processor('ticket-release')
export class TicketReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketReleaseProcessor.name);
  constructor(
    private readonly orderService: OrderService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job<{ orderCode: string }>): Promise<void> {
    const { orderCode } = job.data;
    const orderData = await this.redis.hgetall(
      this.orderService.genRedisKey.order(orderCode),
    );

    if (orderData.status !== OrderStatus.PENDING) {
      this.logger.log(
        `Skipping releaseTickets job for order code: ${orderCode} as the order status is not PENDING`,
      );
      return;
    }

    this.logger.log(
      `Processing releaseTickets job for order code: ${orderCode}`,
    );
    try {
      await this.orderService.cancelOrder(orderCode);
      this.logger.log(
        `Successfully released tickets for order code: ${orderCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to release tickets for order code: ${orderCode}`,
        error,
      );
      console.error(error);
      throw error;
    }
  }
}
