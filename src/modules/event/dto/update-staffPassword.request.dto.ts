import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class UpdateStaffPasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
