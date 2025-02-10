import { OrderDetailResponseDto } from '@/modules/order-detail/dto/order-detail.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Order } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class OrderResponseDto implements Order {
  constructor(partial: Partial<OrderResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  eventId: string;

  @Expose()
  @ApiProperty()
  totalCheckOut: number;

  @Expose()
  @ApiProperty()
  totalQuantity: number;

  @Expose()
  @ApiProperty()
  status: $Enums.OrderStatus;

  @Expose()
  @ApiProperty()
  transactionId: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  @Type(() => OrderDetailResponseDto)
  orderDetails: OrderDetailResponseDto[];

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

export class OrderDetailRedis {
  @Expose()
  @ApiProperty()
  ticketClassId: string;

  @Expose()
  @ApiProperty()
  quantity: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  price: number;
}

export class OrderRedisResponseDto {
  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  eventId: string;

  @Expose()
  @ApiProperty()
  orderDetails: OrderDetailRedis[];

  @Expose()
  @ApiProperty()
  status: $Enums.OrderStatus;

  @Expose()
  @ApiProperty()
  totalCheckout: number;

  @Expose()
  @ApiProperty()
  totalQuantity: number;

  @Expose()
  @ApiProperty()
  transactionAction: $Enums.TransactionAction;

  @Expose()
  @ApiProperty()
  transactionCode: bigint;

  @Expose()
  @ApiProperty()
  paymentGateway: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

export class OrderCheckoutResponseDto {
  @Expose()
  @ApiProperty()
  orderData: OrderRedisResponseDto;

  @Expose()
  @ApiProperty()
  checkoutUrl: string;
}

export class OrderStatisticsReponseDto {
  @Expose()
  @ApiProperty()
  orderId: string;

  @Expose()
  @ApiProperty()
  totalCheckOut: number;

  @Expose()
  @ApiProperty()
  totalQuantity: number;

  @Expose()
  @ApiProperty()
  purchaseTime: string;

  @Expose()
  @ApiProperty()
  userName: string;

  @Expose()
  @ApiProperty()
  userEmail: string;

  @Expose()
  @ApiProperty()
  numberOfCheckIn: number;
}
