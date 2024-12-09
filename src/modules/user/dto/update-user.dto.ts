import { Gender } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderDto } from '../../order/dto/create-order.dto';
import { ConnectOrderDto } from '../../order/dto/connect-order.dto';

export class UpdateUserOrdersRelationInputDto {
  create?: CreateOrderDto[];
  connect?: ConnectOrderDto[];
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  @ApiProperty({ enum: Gender })
  gender?: Gender;
  phoneNumber?: string;
  orders?: UpdateUserOrdersRelationInputDto;
  isVerified?: boolean;
}
