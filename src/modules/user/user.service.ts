import { BaseService } from '@/services/base.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { UserResponseDto } from './dto/user.response.dto';
import { OrderService } from '../order/order.service';
@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly orderService: OrderService,
  ) {
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
