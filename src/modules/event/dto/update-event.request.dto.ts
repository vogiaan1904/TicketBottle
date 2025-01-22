import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventRequestDto } from './create-event.request.dto';
import { EventStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class UpdateEventRequestDto extends PartialType(CreateEventRequestDto) {
  @IsOptional()
  @IsEnum(EventStatus)
  @ApiProperty({ enum: EventStatus, enumName: 'EventStatus' })
  status: EventStatus;

  @IsOptional()
  @IsDate()
  startSellDate;

  @IsOptional()
  @IsDate()
  endSellDate;

  @IsOptional()
  @IsBoolean()
  isFree;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxTicketsPerCustomer;
}
