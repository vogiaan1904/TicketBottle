import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchEventQueryRequestDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsString()
  isFree?: string;

  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  perPage: number = 10;
}
