import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Order } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { Expose } from 'class-transformer';

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
  eventId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
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
  orderDetails: JsonValue;

  @Expose()
  @ApiProperty()
  status: $Enums.OrderStatus;

  @Expose()
  @ApiProperty()
  totalCheckout: number;

  @Expose()
  @ApiProperty()
  transactionAction: $Enums.TransactionAction;

  @Expose()
  @ApiProperty()
  transactionCode: bigint;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
