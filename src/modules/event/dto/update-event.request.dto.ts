import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventRequestDto } from './create-event.request.dto';
import { CategoryType, EventStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v: string) => v.toUpperCase())
      : value.toUpperCase(),
  )
  @IsIn(['MUSIC', 'SPORT', 'THEATERS_AND_ART, OTHER'], {
    each: true,
    message:
      'categories must be some of: MUSIC, SPORT, THEATERS_AND_ART, OTHER',
  })
  categories: CategoryType[];
}
