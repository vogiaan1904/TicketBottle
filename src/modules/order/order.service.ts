import { BaseService } from '@/services/base.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateOrderRequestDto } from './dto/create-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'order', OrderResponseDto);
  }

  async create(dto: CreateOrderRequestDto) {
    const { userId, orderDetails } = dto;

    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const totalCheckOut = orderDetails.reduce(
      (acc, orderDetail) => acc + orderDetail.amount,
      0,
    );
    return await super.create({
      transactionData: dto.transactionData,
      email: dto.email,
      orderDetails: {
        create: orderDetails.map((orderDetail) => ({
          amount: orderDetail.amount,
          ticket: {
            connect: {
              id: orderDetail.ticketId,
            },
          },
        })),
      },
      user: {
        connect: {
          id: userId,
        },
      },
    });
  }

  async findOrdersByUserId(userId: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await super.findMany({
      filter: {
        userId,
      },
    });
  }
}
