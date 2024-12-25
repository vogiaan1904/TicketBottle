import { PickType } from '@nestjs/swagger';
import { OrderResponseDto } from './order.response.dto';

export class UpdateOrderRequestDto extends PickType(OrderResponseDto, [
  'status',
]) {}
