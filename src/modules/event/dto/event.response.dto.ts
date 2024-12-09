import { EventInfoResponseDto } from '@/modules/eventInfo/dto/eventInfo.response.dto';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Event, EventStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class EventResponseDto implements Event {
  constructor(partial: Partial<EventResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  numberOfTickets: number;

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

  @Exclude()
  @ApiHideProperty()
  staffUsername: string;

  @Exclude()
  @ApiHideProperty()
  staffPassword: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
