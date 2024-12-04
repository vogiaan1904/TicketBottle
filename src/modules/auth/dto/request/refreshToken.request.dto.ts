import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDTO {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
