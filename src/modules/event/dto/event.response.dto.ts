import { EventInfoResponseDto } from '@/modules/event-info/dto/event-info.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Event, EventStatus, TicketClass } from '@prisma/client';
import { Expose } from 'class-transformer';

export class EventResponseDto implements Event {
  constructor(partial: Partial<EventResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  startSellDate: Date;

  @Expose()
  @ApiProperty()
  endSellDate: Date;

  @Expose()
  @ApiProperty()
  isFree: boolean;

  @Expose()
  @ApiProperty()
  maxTicketsPerOrder: number;

  @Expose()
  @ApiProperty({ enum: EventStatus, enumName: 'EventStatus' })
  status: EventStatus;

  @Expose()
  @ApiProperty()
  eventInfo: EventInfoResponseDto;

  @Expose()
  @ApiProperty()
  ticketClasses: TicketClass[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
