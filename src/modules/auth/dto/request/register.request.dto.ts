import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterRequestDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEnum(Gender)
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  gender: Gender;

  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phoneNumber: string;
}
