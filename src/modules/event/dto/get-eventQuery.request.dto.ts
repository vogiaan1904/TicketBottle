import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetEventQueryRequestDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  perPage: number = 10;

  @IsOptional()
  @IsString()
  includeInfo: string;
}
