import { IsNumber, IsOptional } from 'class-validator';

export class GetOrdersQueryRequestDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  perPage: number = 10;
}
