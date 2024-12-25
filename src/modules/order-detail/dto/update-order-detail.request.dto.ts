import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDetailRequestDto } from './create-order-detail.request.dto';

export class UpdateOrderDetailDto extends PartialType(
  CreateOrderDetailRequestDto,
) {}
