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
import {
  OrderCheckoutResponseDto,
  OrderResponseDto,
} from './dto/order.response.dto';

import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import * as QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { GetOrdersQueryRequestDto } from './dto/get-orders-query.request.dto';
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

  private genOrderCode(): string {
    const now = dayjs().format('YYMMDD').toString();
    const randomNumber = crypto
      .randomInt(0, 10000000000)
      .toString()
      .padStart(10, '0');
    return now + randomNumber;
  }

  private genTransactionID(): string {
    const now = dayjs().format('YYMMDD').toString();
    return now + '-' + crypto.randomBytes(5).toString('hex');
  }

  async createOrderOnRedis(userId: string, dto: CreateOrderRedisDto) {
    const orderCode = this.genOrderCode();
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
    const result = await this.paymentService.createPaymentLink(
      dto.paymentGateway,
      {
        ip: paymentData.ip,
        host: paymentData.host,
        returnUrl: dto.returnUrl,
        orderCode: code,
        amount: Number(totalCheckout),
      },
    );
    const paymentUrl = result.url;

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
      code: orderCode,
      status: OrderStatus.CANCELLED,
      totalCheckOut: Number(orderData.totalCheckout),
      totalQuantity: Number(orderData.totalQuantity),
      transaction: {
        create: {
          status: TransactionStatus.CANCELLED,
          action: TransactionAction.BUY_TICKET,
          refCode: orderCode,
          gateway: orderData.paymentGateway,
          details: {},
          // id: this.genOrderID(),
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
      // const transactionId = this.genOrderID();
      const refCode = transactionData.code;
      const gateway = transactionData.paymentGateway;

      const createdTransaction = await this.transactionService.create({
        // id: transactionId,
        status: TransactionStatus.COMPLETED,
        action: TransactionAction.BUY_TICKET,
        refCode,
        gateway,
        details: {},
        amount,
      });
      console.log('createdTransaction', createdTransaction);
      await this.completeOrder(
        transactionData.code, // orderCode
        createdTransaction.id, // transactionID
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

      const createdTickets = await Promise.all(ticketPromises);

      // Create order
      return await tx.order.create({
        data: {
          code: orderData.code,
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
              data: createdTickets.flat().map((ticket) => ({
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

    // Generate PDF tickets with QR code
    const attachments = await this.generatePdfTicketsWithQRCode(
      createdOrder.id,
    );

    // Send email
    await this.sendOrderSuccessEmail(
      user.email,
      orderData.orderDetails,
      createdOrder.id,
      attachments,
    );

    // Delete order on redis
    await this.redis.del(orderKey);

    // Invalidate event statistics cache
    await this.eventService.invalidateEventStatisticsCache(orderData.eventId);

    // Return the created order
    return createdOrder;
  }

  async generateQRCode(serialNumber: string): Promise<string> {
    return await QRCode.toDataURL(serialNumber);
  }

  async generatePdfTicketsWithQRCode(orderId: string) {
    const orderData = await this.findOne(
      { id: orderId },
      {
        select: {
          id: true,
          code: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          orderDetails: {
            select: {
              ticket: {
                select: {
                  serialNumber: true,
                  ticketClass: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    );
    const attachments = [];
    for (const ticket of orderData.orderDetails) {
      const qrCode = await this.generateQRCode(ticket.ticket.serialNumber);
      const doc = new jsPDF();
      let currentHeight = 20;
      doc.text(`Order code: ${orderData.code}`, 10, currentHeight);
      currentHeight += 10;
      doc.text(
        `Ordered by ${orderData.user.firstName} ${orderData.user.lastName} at ${dayjs(orderData.createdAt).format('HH:mm, DD/MM/YYYY')}`,
        10,
        currentHeight,
      );
      currentHeight += 10;

      doc.text(
        `Ticket Class: ${ticket.ticket.ticketClass.name}`,
        10,
        currentHeight,
      );
      currentHeight += 10;
      doc.text(
        `Ticket Serial Number: ${ticket.ticket.serialNumber}`,
        10,
        currentHeight,
      );
      currentHeight += 10;

      // Leave extra space then add the QR code image
      doc.addImage(qrCode, 'PNG', 10, currentHeight, 50, 50);
      currentHeight += 60;
      const arrayBuffer = doc.output('arraybuffer');
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));
      attachments.push({
        filename: `ticket_${ticket.ticket.serialNumber}.pdf`,
        content: buffer.toString('base64'),
        encoding: 'base64',
      });
    }
    return attachments;
  }

  async sendOrderSuccessEmail(
    userEmail: string,
    orderDetails: string,
    orderId: string,
    attachments: any[] = [],
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
        orderCode: createdOrder.code,
        eventName: createdOrder.event.eventInfo.name,
        eventDate: formattedStartDate,
        eventLocation: createdOrder.event.eventInfo.location,
        tickets: orderDetailEmailData,
        paymentGateway: createdOrder.transaction.gateway,
        totalAmount: createdOrder.totalCheckOut,
        orderTime: formattedOrderTime,
      },
      attachments,
    });
  }

  async getOrdersByUserId(userId: string, query: GetOrdersQueryRequestDto) {
    const filters = { userId };
    const { page, perPage, status } = query;
    if (query.status) {
      filters['status'] = status;
    }

    return await this.findManyWithPagination({
      filter: filters,
      page,
      perPage,
      options: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          transaction: true,
          event: {
            select: {
              eventInfo: true,
            },
          },
        },
      },
    });
  }

  async getOrderById(orderId: string) {
    const order = await this.databaseService.$queryRaw`
      SELECT 
        o.*,
        u."firstName",
        u."lastName",
        u.email,
        (
          SELECT json_agg(grouped_detail)
          FROM (
            SELECT 
              json_build_object(
                'id', tc.id,
                'name', tc.name,
                'status', tc.status,
                'description', tc.description,
                'price', tc.price,
                'eventId', tc."eventId",
                'createdAt', tc."createdAt",
                'updatedAt', tc."updatedAt"
              ) AS ticketClass,
              json_agg(
                json_build_object(
                  'id', t.id,
                  'serialNumber', t."serialNumber",
                  'isCheckIn', t."isCheckIn",
                  'checkInAt', t."checkInAt",
                  'eventId', t."eventId",
                  'ticketClassId', t."ticketClassId",
                  'createdAt', t."createdAt",
                  'updatedAt', t."updatedAt"
                )
              ) AS tickets,
              count(t.id) AS quantity
            FROM "order_details" od
            JOIN tickets t ON od."ticketId" = t.id
            JOIN "ticket_classes" tc ON t."ticketClassId" = tc.id
            WHERE od."orderId" = o.id
            GROUP BY t."ticketClassId", 
                    tc.id, tc.name, tc.status, tc.description, tc.price, tc."eventId", tc."createdAt", tc."updatedAt"
          ) grouped_detail
        ) AS "orderDetails"
      FROM orders o
      JOIN users u ON o."userId" = u.id
      WHERE o.id = ${orderId};
    `;
    return order;
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
