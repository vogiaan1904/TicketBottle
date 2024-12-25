import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventRequestDto } from './create-event.request.dto';
import { EventStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateEventRequestDto extends PartialType(CreateEventRequestDto) {
  @IsEnum(EventStatus)
  @ApiProperty({ enum: EventStatus, enumName: 'EventStatus' })
  status: EventStatus;
}
