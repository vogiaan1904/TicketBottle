import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAsStaffRequestDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
