import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDTO {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
