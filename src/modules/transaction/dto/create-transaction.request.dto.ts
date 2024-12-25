import { GatewayName } from '@/modules/payment/enums/gatewayName';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  refCode: string;

  @IsEnum(GatewayName)
  @IsNotEmpty()
  gateway: GatewayName;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsObject()
  @IsNotEmpty()
  details: object;

  @IsOptional()
  @IsString()
  orderId: string;
}
