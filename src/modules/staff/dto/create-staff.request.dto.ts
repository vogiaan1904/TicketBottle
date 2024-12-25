import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStaffRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
