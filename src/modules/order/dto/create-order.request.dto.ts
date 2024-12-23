import { GatewayName } from '@/modules/payment/enums/gatewayName';
import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderDetailRedis {
  @IsNotEmpty()
  @IsString()
  ticketClassId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderRedisDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @Type(() => CreateOrderDetailRedis)
  @ValidateNested({ each: true })
  orderDetails: CreateOrderDetailRedis[];

  @Optional()
  @IsString()
  returnUrl: string;

  @IsEnum(GatewayName)
  @IsNotEmpty()
  paymentGateway: GatewayName;
}
