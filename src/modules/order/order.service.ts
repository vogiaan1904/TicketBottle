import { BaseService } from '@/services/base.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';
import {
  CreateOrderDetail,
  CreateOrderRequestDto,
} from './dto/create-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';

@Injectable()
export class OrderService extends BaseService<Order> {
  private readonly redisOrderKeyPrefix = 'order:';
  private readonly redisOrderDetailKeyPrefix = 'orderDetail:';

  constructor(
    private readonly databaseService: DatabaseService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super(databaseService, 'order', OrderResponseDto);
  }
  private generateTemporaryId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createOrderInRedis(dto: CreateOrderRequestDto): Promise<any> {
    const orderId = this.generateTemporaryId();
    const orderKey = `${this.redisOrderKeyPrefix}${orderId}`;
    const orderDetails = [];

    const orderData = {
      ...dto,
      id: orderId,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      orderDetails,
    };

    await this.redis.hset(orderKey, orderData);

    // Optionally, set an expiration time for the temporary order
    await this.redis.expire(orderKey, 3600); // Expires in 1 hour

    return orderData;
  }

  async checkAvailableTicket(
    ticketClassId: string,
    quantity: number,
  ): Promise<boolean> {
    return false;
  }

  async processOrderDetails(orderDetails: CreateOrderDetail[]): Promise<any[]> {
    const orderDetailsData = [];

    await Promise.all(
      orderDetails.map(async (orderDetail) => {
        const isAvailable = await this.checkAvailableTicket(
          orderDetail.ticketClassId,
          orderDetail.quantity,
        );
        if (!isAvailable) {
          throw new BadRequestException('Ticket is not available');
        }
        return isAvailable;
      }),
    );

    for (const orderDetail of orderDetails) {
      orderDetailsData.push({
        ...orderDetail,
      });
    }

    return orderDetailsData;
  }

  async moveOrderToDb(orderId: string): Promise<any> {
    // const orderKey = `${this.redisOrderKeyPrefix}${orderId}`;
    // const orderDataString = await redis.get(orderKey);
    // if (!orderDataString) {
    //   throw new NotFoundException('Order not found in Redis');
    // }
    // const orderData = JSON.parse(orderDataString);
    // // Create the order in the main database
    // const createdOrder = await this.create({
    //   email: orderData.email,
    //   userId: orderData.userId,
    //   quantity: orderData.quantity,
    //   transactionData: orderData.transactionData,
    //   // Add other necessary fields
    // });
    // // Retrieve and migrate OrderDetails
    // const orderDetails = await this.findOrderDetailsByOrderIdInRedis(orderId);
    // for (const detail of orderDetails) {
    //   await this.databaseService.orderDetail.create({
    //     data: {
    //       orderId: createdOrder.id,
    //       ticketId: detail.ticketId,
    //       amount: detail.amount,
    //       // Add other necessary fields
    //     },
    //   });
    //   // Delete the OrderDetail from Redis
    //   const detailKey = `${this.redisOrderDetailKeyPrefix}${detail.id}`;
    //   await this.redis.del(detailKey);
    // }
    // // Delete the Order from Redis
    // await this.redis.del(orderKey);
    // return createdOrder;
  }
}