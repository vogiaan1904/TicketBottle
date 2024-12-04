import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterResponseDTO {
  @IsString()
  @IsNotEmpty()
  verifyAccountToken: string;
}
