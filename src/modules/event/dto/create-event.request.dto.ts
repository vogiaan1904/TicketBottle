import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
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
  maxTicketsPerOrder: number;
}
