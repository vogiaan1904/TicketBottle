import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordRequestDTO {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
