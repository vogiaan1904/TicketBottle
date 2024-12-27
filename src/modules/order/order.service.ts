import { BaseService } from '@/services/base/base.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  Order,
  OrderStatus,
  TransactionAction,
  TransactionStatus,
} from '@prisma/client';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';
import { TicketClassRedisResponseDto } from '../event/dto/ticket-class-redis.response.dto';
import { EventConfigService } from '../event/event-config.service';
import { PaymentService } from '../payment/payment.service';
import { TransactionService } from '../transaction/transaction.service';
import {
  CreateOrderDetailRedis,
  CreateOrderRedisDto,
} from './dto/create-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';
import { TicketQueue } from './enums/queue';
@Injectable()
export class OrderService extends BaseService<Order> {
  private readonly logger = new Logger(OrderService.name);
  readonly genRedisKey = {
    order: (orderCode: string) => `order:${orderCode}`,
    orderDetail: (orderDetailId: string) => `orderDetail:${orderDetailId}`,
    ticketClass: (ticketClassId: string) => `ticketClass:${ticketClassId}`,
  };

  orderTimeout = 660000; // 11 minutes

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventConfigService: EventConfigService,
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    private readonly emailService: EmailService,
    @InjectRedis() private readonly redis: Redis,
    @InjectQueue(TicketQueue.name)
    private readonly ticketReleaseQueue: Queue,
    @InjectQueue(EmailQueue.name)
    private readonly emailQueue: Queue,
  ) {
    super(databaseService, 'order', OrderResponseDto);
  }

  private generateTemporaryId(): string {
    return `${Date.now()}-${Math.random().toString(36)}`;
  }

  async createOrderOnRedis(userId: string, dto: CreateOrderRedisDto) {
    const orderCode = this.generateTemporaryId();
    const transactionCode = this.generateTemporaryId();
    const orderKey = this.genRedisKey.order(orderCode);

    const eventSaleData = await this.eventConfigService.getSaleData(
      dto.eventId,
    );

    if (!eventSaleData.isReadyForSale) {
      throw new BadRequestException('Event is not ready for sale');
    }

    const ticketClassesInfo = eventSaleData.ticketClassesInfo;

    const { totalCheckout, totalQuantity } = dto.orderDetails.reduce(
      (acc, detail) => {
        //calculate total price and total quantity
        const ticketClass = ticketClassesInfo.find(
          (tc) => tc.id === detail.ticketClassId,
        );
        if (!ticketClass) {
          throw new BadRequestException(
            `Ticket class ${detail.ticketClassId} not found`,
          );
        }

        return {
          totalCheckout:
            acc.totalCheckout + ticketClass.price * detail.quantity,
          totalQuantity: acc.totalQuantity + detail.quantity,
        };
      },
      { totalCheckout: 0, totalQuantity: 0 },
    );

    await this.checkIfExceedMaxNumOfTickets(
      userId,
      dto.eventId,
      Number(eventSaleData.maxTicketsPerCustomer),
      totalQuantity,
    );

    const orderDetails = dto.orderDetails.map((detail) => {
      const ticketClass = ticketClassesInfo.find(
        (tc) => tc.id === detail.ticketClassId,
      );
      return { ...detail, price: ticketClass.price, name: ticketClass.name };
    });
    await this.redis
      .multi()
      .hset(orderKey, {
        code: orderCode,
        eventId: dto.eventId,
        userId,
        status: OrderStatus.PENDING,
        totalCheckout,
        totalQuantity,
        createdAt: new Date().toISOString(),
        orderDetails: JSON.stringify(orderDetails),
        transactionCode,
        transactionAction: TransactionAction.BUY_TICKET,
        paymentGateway: dto.paymentGateway,
      })
      .exec();

    await this.reserveTickets(dto.orderDetails, ticketClassesInfo);

    const job = await this.ticketReleaseQueue.add(
      TicketQueue.jobName,
      { orderCode },
      { delay: this.orderTimeout },
    );

    await this.redis.hset(orderKey, 'releaseJobId', job.id);

    const orderData = await this.redis.hgetall(orderKey);

    return orderData;
  }

  async checkout(
    userId: string,
    dto: CreateOrderRedisDto,
    paymentData: { ip: string; host: string },
  ) {
    const orderData = await this.createOrderOnRedis(userId, dto);

    const { code, totalCheckout } = orderData;
    const paymentUrl = await this.paymentService.createPaymentLink(
      dto.paymentGateway,
      {
        ip: paymentData.ip,
        host: paymentData.host,
        returnUrl: dto.returnUrl,
        orderCode: code,
        amount: Number(totalCheckout),
      },
    );

    return { orderData, paymentUrl };
  }

  async checkIfExceedMaxNumOfTickets(
    userId: string,
    eventId: string,
    maxTicketsPerCustomer: number,
    totalQuantity: number,
  ) {
    const placedOrders = await this.findMany({
      filter: { userId, eventId, status: 'COMPLETED' },
    });
    const placedQuantity = placedOrders.reduce(
      (acc, order) => acc + order.totalQuantity,
      0,
    );
    if (placedQuantity + totalQuantity > maxTicketsPerCustomer) {
      throw new BadRequestException(
        'Exceed max number of tickets per customer',
      );
    }
  }

  private async reserveTickets(
    orderDetails: CreateOrderDetailRedis[],
    ticketClassesInfo: TicketClassRedisResponseDto[],
  ) {
    this.logger.log('Reserving tickets...');
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

  async cancelOrder(orderCode: string): Promise<OrderResponseDto> {
    const orderKey = this.genRedisKey.order(orderCode);
    const orderData = await this.redis.hgetall(orderKey);
    if (!orderData || orderData.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order not found or already completed');
    }

    await this.releaseTickets(orderCode);

    // delete order on redis
    await this.redis.del(orderKey);

    // move order to primary db
    const canceledOrder = await this.create({
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
      status: OrderStatus.CANCELLED,
      email: 'notbuyticket@gmail.com',
      totalCheckOut: Number(orderData.totalCheckout),
      totalQuantity: Number(orderData.totalQuantity),
      code: orderCode,
      transaction: {
        create: {
          status: TransactionStatus.CANCELLED,
          action: TransactionAction.BUY_TICKET,
          refCode: orderCode,
          gateway: orderData.paymentGateway,
          details: {},
          id: this.generateTemporaryId(),
          amount: Number(orderData.totalCheckout),
        },
      },
    });

    return canceledOrder;
  }

  async releaseTickets(orderCode: string) {
    // timeout or cancel order
    const orderKey = this.genRedisKey.order(orderCode);

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

  async processTransaction(transactionID: string): Promise<void> {
    const transactionData = await this.redis.hgetall(
      this.genRedisKey.order(transactionID),
    );
    if (!transactionData) {
      throw new Error(`Transaction with ID ${transactionID} not found`);
    }

    if (transactionData.status !== 'PENDING') {
      throw new Error(`Transaction with ID ${transactionID} is not PENDING`);
    }

    // Ticket purchase
    if (transactionData.transactionAction === 'BUY_TICKET') {
      const amount = parseFloat(transactionData.totalCheckout);
      const transactionId = this.generateTemporaryId();
      const refCode = transactionData.code;
      const gateway = transactionData.paymentGateway;

      await this.transactionService.create({
        id: transactionId,
        status: TransactionStatus.COMPLETED,
        action: TransactionAction.BUY_TICKET,
        refCode,
        gateway,
        details: {},
        amount,
      });

      await this.completeOrder(
        transactionData.code, // orderCode
        transactionId, // transactionID
      );
    }
  }

  async completeOrder(orderCode: string, transactionId: string) {
    const orderKey = this.genRedisKey.order(orderCode);

    // Retrieve order data from Redis
    const orderData = await this.redis.hgetall(orderKey);
    if (!orderData || orderData.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order not found or already completed');
    }

    await this.redis.hset(orderKey, 'status', OrderStatus.COMPLETED);

    const orderDetails = JSON.parse(orderData.orderDetails);
    const createdOrder = await this.databaseService.$transaction(async (tx) => {
      const ticketPromises = orderDetails.map(async (detail) => {
        const ticketData = Array.from({ length: detail.quantity }, () => ({
          ticketClassId: detail.ticketClassId,
          eventId: orderData.eventId,
        }));

        return await tx.ticket.createManyAndReturn({ data: ticketData });
      });

      const a = await Promise.all(ticketPromises);
      return await tx.order.create({
        data: {
          status: OrderStatus.COMPLETED,
          email: 'notbuyticket@gmail.com', // Replace with actual email if available
          totalCheckOut: Number(orderData.totalCheckout),
          totalQuantity: Number(orderData.totalQuantity),
          id: orderCode,
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
            createMany: {
              data: a.flat().map((ticket) => ({
                ticketId: ticket.id,
              })),
            },
          },
          transaction: {
            connect: {
              id: transactionId,
            },
          },
        },
      });
    });

    await this.redis.del(orderKey);

    return createdOrder;
  }
}
