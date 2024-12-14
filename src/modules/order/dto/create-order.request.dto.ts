import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateOrderDetail {
  @IsNotEmpty()
  @IsString()
  ticketClassId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderRequestDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  orderDetails: CreateOrderDetail[];
}
