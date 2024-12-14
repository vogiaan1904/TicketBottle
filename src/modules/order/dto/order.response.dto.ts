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
  quantity: number;

  @Expose()
  @ApiProperty()
  totalCheckOut: number;

  @Expose()
  @ApiProperty()
  transactionData: JsonValue;

  @Expose()
  @ApiProperty()
  status: $Enums.OrderStatus;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
