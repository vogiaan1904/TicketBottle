import { BaseService } from '@/services/base.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';
import { TicketClassRedisResponseDto } from '../event/dto/ticket-class-redis.response.dto';
import { EventConfigService } from '../event/event-config.service';
import {
  CreateOrderDetailRedis,
  CreateOrderRedisDto,
} from './dto/create-order.request.dto';
import {
  OrderRedisResponseDto,
  OrderResponseDto,
} from './dto/order.response.dto';

@Injectable()
export class OrderService extends BaseService<Order> {
  readonly genRedisKey = {
    order: (orderId: string) => `order:${orderId}`,
    orderDetail: (orderDetailId: string) => `orderDetail:${orderDetailId}`,
    ticketClass: (ticketClassId: string) => `ticketClass:${ticketClassId}`,
  };

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventConfigService: EventConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super(databaseService, 'order', OrderResponseDto);
  }
  private generateTemporaryId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createOrderOnRedis(dto: CreateOrderRedisDto) {
    const orderId = this.generateTemporaryId();
    const orderKey = this.genRedisKey.order(orderId);

    const eventSaleData = await this.eventConfigService.getSaleData(
      dto.eventId,
    );

    if (!eventSaleData.isReadyForSale) {
      throw new BadRequestException('Event is not ready for sale');
    }

    const ticketClassesInfo = eventSaleData.ticketClassesInfo;

    await this.redis
      .multi()
      .hset(orderKey, {
        id: orderId,
        eventId: dto.eventId,
        userId: dto.userId,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        orderDetails: JSON.stringify(dto.orderDetails),
      })
      .expire(orderKey, 3600) //1 hour
      .exec();

    await this.reserveTickets(dto.orderDetails, ticketClassesInfo);

    return this.redis.hgetall(orderKey);
  }

  private async reserveTickets(
    orderDetails: CreateOrderDetailRedis[],
    ticketClassesInfo: TicketClassRedisResponseDto[],
  ) {
    const multi = this.redis.multi();

    for (const detail of orderDetails) {
      const ticketClass = ticketClassesInfo.find(
        (tc) => tc.id === detail.ticketClassId,
      );
      if (!ticketClass) {
        throw new BadRequestException(
          `Ticket class ${detail.ticketClassId} not found`,
        );
      }
      if (ticketClass.available < detail.quantity) {
        throw new BadRequestException(
          `Insufficient tickets for class ${detail.ticketClassId}`,
        );
      }
      multi.hincrby(
        this.genRedisKey.ticketClass(detail.ticketClassId),
        'available',
        -detail.quantity,
      );
      multi.hincrby(
        this.genRedisKey.ticketClass(detail.ticketClassId),
        'hold',
        detail.quantity,
      );
    }

    const results = await multi.exec();
    if (results === null) {
      throw new BadRequestException('Failed to reserve tickets');
    }
  }

  async moveOrderToDb(orderId: string): Promise<any> {}
}
