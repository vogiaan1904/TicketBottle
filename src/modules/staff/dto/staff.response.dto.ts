import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Staff, StaffRole } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class StaffResponseDto implements Staff {
  constructor(partial: Partial<StaffResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty({ enum: StaffRole, enumName: 'StaffRole' })
  role: StaffRole;

  @Exclude()
  @ApiHideProperty()
  password: string;
}
