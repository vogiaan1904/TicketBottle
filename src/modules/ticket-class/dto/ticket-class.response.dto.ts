import { ApiProperty } from '@nestjs/swagger';
import { TicketClass } from '@prisma/client';
import { Expose } from 'class-transformer';

export class TicketClassResponseDto implements TicketClass {
  constructor(partial: Partial<TicketClassResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  eventId: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  totalQuantity: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
