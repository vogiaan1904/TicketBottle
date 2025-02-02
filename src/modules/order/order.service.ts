import { BaseService } from '@/services/base/base.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  Order,
  OrderStatus,
  TransactionAction,
  TransactionStatus,
} from '@prisma/client';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { TicketClassRedisResponseDto } from '../event/dto/ticket-class-redis.response.dto';
import { EventConfigService } from '../event/event-config.service';
import { PaymentService } from '../payment/payment.service';
import { TransactionService } from '../transaction/transaction.service';
import { UserService } from '../user/user.service';
import {
  CreateOrderDetailRedis,
  CreateOrderRedisDto,
} from './dto/create-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';

import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { GetOrdersQueryRequestDto } from './dto/get-orders-quert.request.dto';
import { EmailQueue, TicketQueue } from './enums/queue';
import { EventService } from '../event/event.service';

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
    private readonly userService: UserService,
    private readonly eventService: EventService,
    @InjectRedis() private readonly redis: Redis,
    @InjectQueue(TicketQueue.name)
    private readonly ticketReleaseQueue: Queue,
    @InjectQueue(EmailQueue.name)
    private readonly emailQueue: Queue,
  ) {
    super(databaseService, 'order', OrderResponseDto);
  }

  private genOrderID(): string {
    const now = dayjs().format('YYMMDD').toString();
    return now + crypto.randomBytes(5).toString('hex');
  }
  private genTransactionID(): string {
    const now = dayjs().format('YYMMDD').toString();
    return now + '-' + crypto.randomBytes(5).toString('hex');
  }

  async createOrderOnRedis(userId: string, dto: CreateOrderRedisDto) {
    const orderCode = this.genOrderID();
    const transactionCode = this.genTransactionID();
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

    // await this.checkIfExceedMaxNumOfTickets(
    //   userId,
    //   dto.eventId,
    //   Number(eventSaleData.maxTicketsPerCustomer),
    //   totalQuantity,
    // );

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
      transaction: {
        create: {
          status: TransactionStatus.CANCELLED,
          action: TransactionAction.BUY_TICKET,
          refCode: orderCode,
          gateway: orderData.paymentGateway,
          details: {},
          id: this.genOrderID(),
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
      throw new InternalServerErrorException(
        `Transaction with ID ${transactionID} not found`,
      );
    }

    if (transactionData.status !== 'PENDING') {
      throw new BadRequestException(
        `Transaction with ID ${transactionID} is not PENDING`,
      );
    }

    // Ticket purchase
    if (transactionData.transactionAction === 'BUY_TICKET') {
      const amount = parseFloat(transactionData.totalCheckout);
      const transactionId = this.genOrderID();
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

    const user = await this.userService.findById(orderData.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const orderDetails = JSON.parse(orderData.orderDetails);
    const createdOrder = await this.databaseService.$transaction(async (tx) => {
      const ticketPromises = orderDetails.map(async (detail) => {
        await tx.ticketClass.update({
          //update number of sold tickets for each ticket class
          where: {
            id: detail.ticketClassId,
          },
          data: {
            soldQuantity: {
              increment: detail.quantity,
            },
          },
        });

        const ticketData = Array.from({ length: detail.quantity }, () => ({
          ticketClassId: detail.ticketClassId,
          eventId: orderData.eventId,
        }));

        return await tx.ticket.createManyAndReturn({ data: ticketData });
      });

      const a = await Promise.all(ticketPromises);

      // Create order
      return await tx.order.create({
        data: {
          status: OrderStatus.COMPLETED,
          totalCheckOut: Number(orderData.totalCheckout),
          totalQuantity: Number(orderData.totalQuantity),
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

    // Send email
    await this.sendOrderSuccessEmail(
      user.email,
      orderData.orderDetails,
      createdOrder.id,
    );

    // Delete order on redis
    await this.redis.del(orderKey);

    // Invalidate event statistics cache
    await this.eventService.invalidateEventStatisticsCache(orderData.eventId);

    // Return the created order
    return createdOrder;
  }

  async sendOrderSuccessEmail(
    userEmail: string,
    orderDetails: string,
    orderId: string,
  ) {
    const orderDetailsJSON = JSON.parse(orderDetails);
    const orderDetailEmailData = orderDetailsJSON.map((detail) => ({
      ticketClassName: detail.name,
      quantity: detail.quantity,
      price: detail.price,
    }));

    const createdOrder = await this.findOne(
      { id: orderId },
      {
        include: {
          transaction: true,
          event: {
            select: {
              eventInfo: true,
            },
          },
        },
      },
    );
    const formattedOrderTime = dayjs(createdOrder.createdAt).format(
      'HH:mm, DD/MM/YYYY',
    );
    const formattedStartDate = dayjs(
      createdOrder.event.eventInfo.startDate,
    ).format('HH:mm, DD/MM/YYYY');

    await this.emailQueue.add(EmailQueue.jobName, {
      email: userEmail,
      orderData: {
        orderId: createdOrder.id,
        eventName: createdOrder.event.eventInfo.name,
        eventDate: formattedStartDate,
        eventLocation: createdOrder.event.eventInfo.location,
        tickets: orderDetailEmailData,
        paymentGateway: createdOrder.transaction.gateway,
        totalAmount: createdOrder.totalCheckOut,
        orderTime: formattedOrderTime,
      },
    });
  }

  //Statistics for event dashboard
  async getOrdersStatisticByEventId(
    eventId: string,
    dto: GetOrdersQueryRequestDto,
  ) {
    const { page, perPage } = dto;
    const ordersDataWithPagination = await this.findManyWithPagination({
      filter: { eventId, status: 'COMPLETED' },
      page,
      perPage,
      options: {
        select: {
          id: true,
          totalCheckOut: true,
          totalQuantity: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          orderDetails: {
            where: {
              ticket: {
                isCheckIn: true,
              },
            },
          },
        },
      },
    });

    const ordersStatistics = ordersDataWithPagination.data.map((order) => ({
      orderId: order.id,
      totalCheckOut: order.totalCheckOut,
      totalQuantity: order.totalQuantity,
      purchaseTime: dayjs(order.createdAt).format('HH:mm, DD/MM/YYYY'),
      userName: `${order.user.firstName} ${order.user.lastName}`,
      userEmail: order.user.email,
      numberOfCheckIn: order.orderDetails.length,
    }));

    ordersDataWithPagination.data = ordersStatistics;

    return ordersDataWithPagination;
  }
}
