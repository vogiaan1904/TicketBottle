import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from '@/services/base.service';
import { Staff } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { StaffResponseDto } from './dto/staff.response.dto';
import { CreateStaffRequestDto } from './dto/create-staff.request.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService extends BaseService<Staff> {
  private SALT_ROUND = 10;
  constructor(readonly databaseService: DatabaseService) {
    super(databaseService, 'staff', StaffResponseDto);
  }

  async create(data: CreateStaffRequestDto) {
    const existingStaff = await this.databaseService.staff.findUnique({
      where: {
        username: data.username,
      },
    });
    if (existingStaff) {
      throw new BadRequestException('Staff with this username already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUND);
    return await super.create({
      username: data.username,
      password: hashedPassword,
    });
  }
}
