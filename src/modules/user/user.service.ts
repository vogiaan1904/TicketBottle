import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { User } from '@prisma/client';
import { BaseService } from '@/services/base.service';
import { UserResponseDto } from './dto/user.response.dto';
@Injectable()
export class UserService extends BaseService<User> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'user', UserResponseDto);
  }
  async getUserByIdOrEmail(idOrEmail: string): Promise<UserResponseDto> {
    const user = await super.findOne({
      OR: [
        {
          id: {
            equals: idOrEmail,
          },
        },
        {
          email: {
            equals: idOrEmail,
          },
        },
      ],
    });
    return user;
  }
}
