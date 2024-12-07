import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createUserDto: Prisma.UserCreateInput) {
    return await this.databaseService.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return await this.databaseService.user.findMany();
  }

  async findOne(filter: Prisma.UserWhereUniqueInput) {
    return await this.databaseService.user.findUnique({
      where: filter,
    });
  }

  async update(
    filter: Prisma.UserWhereUniqueInput,
    updateUserDto: Prisma.UserUpdateInput,
  ) {
    return await this.databaseService.user.update({
      where: filter,
      data: updateUserDto,
    });
  }

  async remove(filter: Prisma.UserWhereUniqueInput) {
    return await this.databaseService.user.delete({
      where: filter,
    });
  }
}
