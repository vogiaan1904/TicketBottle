import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderRequestDto } from './create-order.request.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateOrderRequestDto extends PartialType(
  OmitType(CreateOrderRequestDto, ['userId']),
) {}
