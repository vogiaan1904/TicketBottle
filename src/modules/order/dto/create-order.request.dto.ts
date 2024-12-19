import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateOrderDetailRedis {
  @IsNotEmpty()
  @IsString()
  ticketClassId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderRedisDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  orderDetails: CreateOrderDetailRedis[];
}
