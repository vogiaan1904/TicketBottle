import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Event, EventStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class EventResponseDto implements Event {
  constructor(partial: Partial<EventResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  numberOfTickets: number;

  @Expose()
  startSellDate: Date;

  @Expose()
  endSellDate: Date;

  @Expose()
  isFree: boolean;

  @Expose()
  maxTicketsPerOrder: number;

  @Expose()
  @ApiProperty({ enum: EventStatus, enumName: 'EventStatus' })
  status: EventStatus;

  @Exclude()
  @ApiHideProperty()
  staffUsername: string;

  @Exclude()
  @ApiHideProperty()
  staffPassword: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
