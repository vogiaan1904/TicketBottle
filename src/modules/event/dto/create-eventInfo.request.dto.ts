import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventInfoRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsNotEmpty()
  @IsString()
  organizerId: string;
}
