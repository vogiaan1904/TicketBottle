import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAccountRequestQuery {
  @IsNotEmpty()
  @IsString()
  token: string;
}
