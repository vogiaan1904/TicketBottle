import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendEmailVerfiyRequestDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
