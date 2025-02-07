import { TicketResponseDto } from '@/modules/ticket/dto/ticket.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { OrderDetail } from '@prisma/client';
import { Expose } from 'class-transformer';

export class OrderDetailResponseDto implements OrderDetail {
  constructor(partial: Partial<OrderDetailResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  orderId: string;

  @Expose()
  @ApiProperty()
  ticketId: string;

  @Expose()
  @ApiProperty()
  amount: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  ticket: TicketResponseDto;
}
