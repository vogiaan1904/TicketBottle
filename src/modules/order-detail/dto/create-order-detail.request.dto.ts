import { IsNumber, IsString } from 'class-validator';

export class CreateOrderDetailRequestDto {
  @IsString()
  ticketId: string;

  @IsNumber()
  amount: number;
}
