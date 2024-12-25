import { ApiProperty } from '@nestjs/swagger';
import { Ticket, TicketStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class TicketResponseDto implements Ticket {
  constructor(partial: Partial<TicketResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty({ enum: TicketStatus, enumName: 'TicketStatus' })
  status: TicketStatus;

  @Expose()
  @ApiProperty()
  serialNumber: string;

  @Expose()
  @ApiProperty()
  ticketClassId: string;

  @Expose()
  @ApiProperty()
  eventId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
