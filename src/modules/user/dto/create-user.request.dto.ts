import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserRequestDto {
  @IsEmail()
  @IsString()
  email: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  @IsStrongPassword()
  password: string;
  @IsEnum(Gender)
  @Transform(({ value }) => value.toUpperCase())
  gender: string;
  @IsPhoneNumber('VN')
  phoneNumber: string;
}
