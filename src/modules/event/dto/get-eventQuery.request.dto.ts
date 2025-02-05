import { CategoryType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetEventQueryRequestDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  perPage: number = 10;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsIn(['MUSIC', 'SPORT', 'THEATERS_AND_ART, OTHER'], {})
  category: CategoryType;
}
