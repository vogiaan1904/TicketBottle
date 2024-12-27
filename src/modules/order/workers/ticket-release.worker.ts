import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrderService } from '../order.service';
import { TicketQueue } from '../enums/queue';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { OrderStatus } from '@prisma/client';

@Processor(TicketQueue.name)
export class TicketReleaseWorkder extends WorkerHost {
  private readonly logger = new Logger(TicketReleaseWorkder.name);
  readonly genRedisKey = {
    order: (orderCode: string) => `order:${orderCode}`,
  };
  constructor(
    private readonly orderService: OrderService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job<{ orderCode: string }>): Promise<void> {
    const { orderCode } = job.data;
    this.logger.log(`Processing releaseTickets job for order Id: ${orderCode}`);
    try {
      const orderKey = this.genRedisKey.order(orderCode);
      const orderData = await this.redis.hgetall(orderKey);
      if (!orderData || orderData.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Order not found or already completed');
      }
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
