import { CreateOrderDetailRequestDto } from '@/modules/order-detail/dto/create-order-detail.request.dto';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrderRequestDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsObject()
  @IsNotEmpty()
  transactionData: any;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailRequestDto)
  orderDetails: CreateOrderDetailRequestDto[];
}
