import { BaseService } from '@/services/base/base.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { UserResponseDto } from './dto/user.response.dto';
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
}
