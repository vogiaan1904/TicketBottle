import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { UserResponseDto } from './dto/user.response.dto';
import { GetUsersQueryRequestDto } from './dto/get-users-query.request.dto';
import { BaseService } from '@/services/base/base.service';
@Injectable()
export class UserService extends BaseService<User> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'user', UserResponseDto);
  }

  async findByEmail(email: string) {
    const user = await super.findOne({
      email,
    });
    return user;
  }

  async findById(id: string) {
    return await super.findOne({
      id,
    });
  }

  async getAllUsers(dto: GetUsersQueryRequestDto) {
    const { page, perPage } = dto;
    return await super.findManyWithPagination({ page, perPage });
  }
}
