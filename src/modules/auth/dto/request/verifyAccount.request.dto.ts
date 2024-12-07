import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAccountRequestDTO {
  @IsNotEmpty()
  @IsString()
  token: string;
}
