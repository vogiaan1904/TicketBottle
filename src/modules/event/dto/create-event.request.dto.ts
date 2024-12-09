import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateEventRequestDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  numberOfTickets: number;

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
