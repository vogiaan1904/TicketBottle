import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTicketClassRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  totalQuantity: number;
}
