import { ApiProperty } from '@nestjs/swagger';
import { EventInfo } from '@prisma/client';
import { Expose } from 'class-transformer';

export class EventInfoResponseDto implements EventInfo {
  constructor(partial: Partial<EventInfoResponseDto>) {
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
  organizerId: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  startDate: Date;

  @Expose()
  @ApiProperty()
  endDate: Date;

  @Expose()
  @ApiProperty()
  thumbnail: string;

  @Expose()
  @ApiProperty()
  location: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
