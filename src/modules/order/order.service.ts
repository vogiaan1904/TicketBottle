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
import { OrderResponseDto } from './dto/order.response.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export enum ticketQueue {
  name = 'ticket-release',
  jobName = 'release-tickets',
}
@Injectable()
export class OrderService extends BaseService<Order> {
  readonly genRedisKey = {
    order: (orderId: string) => `order:${orderId}`,
    orderDetail: (orderDetailId: string) => `orderDetail:${orderDetailId}`,
    ticketClass: (ticketClassId: string) => `ticketClass:${ticketClassId}`,
  };
  orderTimeout = 600000;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventConfigService: EventConfigService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    @InjectQueue(ticketQueue.name)
    private readonly ticketReleaseQueue: Queue,
  ) {
    super(databaseService, 'order', OrderResponseDto);
  }
  private generateTemporaryId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createOrderOnRedis(userId: string, dto: CreateOrderRedisDto) {
    const orderId = this.generateTemporaryId();
    const orderKey = this.genRedisKey.order(orderId);

    const eventSaleData = await this.eventConfigService.getSaleData(
      dto.eventId,
    );

    if (!eventSaleData.isReadyForSale) {
      throw new BadRequestException('Event is not ready for sale');
    }

    const ticketClassesInfo = eventSaleData.ticketClassesInfo;

    const totalCheckout = dto.orderDetails.reduce((total, detail) => {
      //calculate total price
      const ticketClass = ticketClassesInfo.find(
        (tc) => tc.id === detail.ticketClassId,
      );
      if (!ticketClass) {
        throw new BadRequestException(
          `Ticket class ${detail.ticketClassId} not found`,
        );
      }
      return total + ticketClass.price * detail.quantity;
    }, 0);

    const orderDetails = dto.orderDetails.map((detail) => {
      //add price to each orderDetail
      const ticketClass = ticketClassesInfo.find(
        (tc) => tc.id === detail.ticketClassId,
      );
      return { ...detail, price: ticketClass.price };
    });

    await this.redis
      .multi()
      .hset(orderKey, {
        id: orderId,
        eventId: dto.eventId,
        userId,
        status: OrderStatus.PENDING,
        totalCheckout,
        createdAt: new Date().toISOString(),
        orderDetails: JSON.stringify(orderDetails),
      })
      .exec();

    await this.reserveTickets(dto.orderDetails, ticketClassesInfo);

    const job = await this.ticketReleaseQueue.add(
      ticketQueue.jobName,
      { orderId },
      { delay: this.orderTimeout }, // 10 minutes
    );

    await this.redis.hset(orderKey, 'releaseJobId', job.id);

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

  async cancelOrder(orderId: string): Promise<OrderResponseDto> {
    const orderKey = this.genRedisKey.order(orderId);

    const orderData = await this.redis.hgetall(orderKey);
    if (!orderData || orderData.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order not found or already completed');
    }

    await this.releaseTickets(orderId);

    await this.redis.hset(orderKey, 'status', OrderStatus.CANCELLED);

    const canceledOrder = await this.create({
      data: {
        user: {
          connect: {
            id: orderData.userId,
          },
        },
        event: {
          connect: {
            id: orderData.eventId,
          },
        },
        orderDetails: [],
        status: orderData.status,
        email: 'notbuyticket@gmail.com',
        transactionData: {},
        totalCheckout: orderData.totalCheckout,
      },
    });

    return canceledOrder;
  }

  async releaseTickets(orderId: string) {
    // timeout or cancel order
    const orderKey = this.genRedisKey.order(orderId);

    const orderData = await this.redis.hgetall(orderKey);
    if (!orderData || orderData.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order not found or already completed');
    }

    const orderDetails = JSON.parse(orderData.orderDetails);

    const multi = this.redis.multi();
    for (const detail of orderDetails) {
      multi.hincrby(
        this.genRedisKey.ticketClass(detail.ticketClassId),
        'available',
        detail.quantity,
      );
      multi.hincrby(
        this.genRedisKey.ticketClass(detail.ticketClassId),
        'hold',
        -detail.quantity,
      );
    }
    const results = await multi.exec();
    if (results === null) {
      throw new BadRequestException('Failed to release tickets');
    }
  }

  async completeOrder(orderId: string) {
    const orderKey = this.genRedisKey.order(orderId);

    const orderData = await this.redis.hgetall(orderKey);
    if (!orderData || orderData.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order not found or already completed');
    }

    await this.redis.hset(orderKey, 'status', OrderStatus.COMPLETED);

    const orderDetails = JSON.parse(orderData.orderDetails);

    return await this.databaseService.$transaction(async (tx) => {
      const createAndGetTicketIds = orderDetails.map(async (detail) => {
        const ticketData = [];
        for (let i = 0; i < detail.quantity; i++) {
          const ticket = await tx.ticket.create({
            data: {
              ticketClass: {
                connect: {
                  id: detail.ticketClassId,
                },
              },
              event: {
                connect: {
                  id: orderData.eventId,
                },
              },
            },
          });
          ticketData.push({ id: ticket.id, amount: orderDetails.price });
        }
        return ticketData;
      });

      await tx.order.create({
        data: {
          user: {
            connect: {
              id: orderData.userId,
            },
          },
          event: {
            connect: {
              id: orderData.eventId,
            },
          },
          orderDetails: {
            //each linked to 1 ticket of 1 ticketClass
            createMany: {
              data: createAndGetTicketIds.flat(),
            },
          },
          status: OrderStatus.COMPLETED,
          email: 'notbuyticket@gmail.com',
          transactionData: {},
          totalCheckOut: Number(orderData.totalCheckout),
        },
      });
    });
  }

  async moveOrderToPrimaryDb(orderId: string) {
    const orderKey = this.genRedisKey.order(orderId);

    const orderData = await this.redis.hgetall(orderKey);
    if (!orderData || orderData.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order not found or already completed');
    }

    const orderDetails = JSON.parse(orderData.orderDetails);
  }
}
