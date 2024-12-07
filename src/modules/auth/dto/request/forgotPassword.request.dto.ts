import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequestDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
