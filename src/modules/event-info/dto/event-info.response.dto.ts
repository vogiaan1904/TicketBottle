import { EventInfo } from '@prisma/client';
import { Expose } from 'class-transformer';

export class EventInfoResponseDto implements EventInfo {
  constructor(partial: Partial<EventInfoResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: string;

  @Expose()
  eventId: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  startDate: Date;

  @Expose()
  thumbnail: string;

  @Expose()
  location: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
