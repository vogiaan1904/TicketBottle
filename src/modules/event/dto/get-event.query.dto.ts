import { Category } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetEventsQueryDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  perPage: number = 20;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v: string) => v.toUpperCase())
      : value.toUpperCase(),
  )
  @IsIn(['MUSIC', 'SPORT', 'THEATERS_AND_ART', 'OTHER'], {
    each: true,
  })
  categories: Category;

  @IsOptional()
  @IsString()
  from: string;

  @IsOptional()
  @IsString()
  to: string;

  @IsString()
  @IsOptional()
  q: string;

  @IsOptional()
  @IsString()
  isFree: string;
}

export class GetRecommendedByEventIdQueryDto {
  @IsNotEmpty()
  @IsString()
  eventId?: string;
}

export class GetRecommendedQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['this_month', 'this_week'], {})
  at: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
