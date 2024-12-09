import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Gender, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto implements User {
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @ApiProperty({ enum: Gender, enumName: 'gender' })
  gender: Gender;

  @Expose()
  phoneNumber: string | null;

  // @Expose()
  // orders?: Order[];

  @Expose()
  isVerified: boolean;

  @Exclude()
  @ApiHideProperty()
  password: string;
}
