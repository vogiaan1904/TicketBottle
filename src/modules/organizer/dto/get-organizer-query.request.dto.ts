import { IsNumber, IsOptional } from 'class-validator';

export class GetOrganizerQueryRequestDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  perPage: number = 10;
}
