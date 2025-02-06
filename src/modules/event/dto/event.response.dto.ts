import { EventInfoResponseDto } from '@/modules/event-info/dto/event-info.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Event, EventStatus, TicketClass } from '@prisma/client';
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
  isNewTrending: boolean;

  @Expose()
  @ApiProperty()
  maxTicketsPerCustomer: number;

  @Expose()
  @ApiProperty({ enum: EventStatus, enumName: 'EventStatus' })
  status: EventStatus;

  @Expose()
  @ApiProperty()
  eventInfo: EventInfoResponseDto;

  @Expose()
  @ApiProperty()
  ticketCount: number;

  @Expose()
  @ApiProperty()
  ticketClasses: TicketClass[];

  @Expose()
  @ApiProperty()
  categories: $Enums.Category[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class EventByCategoryResponseDto {
  @Expose()
  @ApiProperty()
  categoryName: string;

  @Expose()
  @ApiProperty()
  events: EventResponseDto[];
}
export class EventsByCategoryResponseDto {
  @Expose()
  @ApiProperty()
  events: EventByCategoryResponseDto[];
}

export class TicketClassStatisticsDto {
  @Expose()
  @ApiProperty()
  ticketClassName: string;

  @Expose()
  @ApiProperty()
  soldTickets: number;

  @Expose()
  @ApiProperty()
  remainingTickets: number;

  @Expose()
  @ApiProperty()
  netRevenue: number;

  @Expose()
  @ApiProperty()
  todayRevenue: number;

  @Expose()
  @ApiProperty()
  todaySoldTickets: number;
}

export class EventStatisticsResponseDto {
  @Expose()
  @ApiProperty()
  soldTickets: number;

  @Expose()
  @ApiProperty()
  netRevenue: number;

  @Expose()
  @ApiProperty()
  todaySoldTickets: number;

  @Expose()
  @ApiProperty()
  todayRevenue: number;

  @Expose()
  @ApiProperty()
  attendanceRate: number;

  @Expose()
  @ApiProperty()
  statisticsPerClass: TicketClassStatisticsDto[];
}
