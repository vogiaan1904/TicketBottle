import { EventResponseDto } from '@/modules/event/dto/event.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Organizer } from '@prisma/client';
import { Expose } from 'class-transformer';

export class OrganizerResponseDto implements Organizer {
  constructor(partial: Partial<OrganizerResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  thumbnail: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  phone: string;

  @Expose()
  @ApiProperty()
  address: string;

  events: EventResponseDto[];
}
