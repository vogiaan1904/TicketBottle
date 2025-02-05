import { OrderStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetOrdersQueryRequestDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  perPage: number = 10;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsIn(['PENDING', 'COMPLETED', 'CANCELLED'], {
    message: 'Status must be one of: PENDING, COMPLETED, CANCELLED',
  })
  status?: OrderStatus;
}
