import { Category } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateEventRequestDto {
  @IsDate()
  @IsNotEmpty()
  startSellDate: Date;

  @IsDate()
  @IsNotEmpty()
  endSellDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  isFree: boolean;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  maxTicketsPerCustomer: number;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v: string) => v.toUpperCase())
      : value.toUpperCase(),
  )
  @IsIn(['MUSIC', 'SPORT', 'THEATERS_AND_ART', 'OTHER'], {
    each: true,
    message:
      'categories must be some of: MUSIC, SPORT, THEATERS_AND_ART, OTHER',
  })
  categories: Category[];
}
