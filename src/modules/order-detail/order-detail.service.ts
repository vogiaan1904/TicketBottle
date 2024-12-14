import { BaseService } from '@/services/base.service';
import { Injectable } from '@nestjs/common';
import { OrderDetail } from '@prisma/client';
import { OrderDetailResponseDto } from './dto/order-detail.response.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrderDetailService extends BaseService<OrderDetail> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'orderDetail', OrderDetailResponseDto);
  }

  async findOrderDetailsByOrderId(orderId: string) {
    return await super.findMany({ filter: { orderId } });
  }
}
