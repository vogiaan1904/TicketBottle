import { DatabaseService } from '../modules/database/database.service';
import { BaseServiceInterface } from './interfaces/base.interface';
export abstract class BaseService<T> implements BaseServiceInterface<T> {
  constructor(
    private prisma: DatabaseService,
    private model: string,
  ) {}

  async findAll() {
    return this.prisma[this.model].findMany();
  }
  async findOne(filter: any) {
    return this.prisma[this.model].findUnique({
      where: filter,
    });
  }
  async create(data: any) {
    return this.prisma[this.model].create({
      data,
    });
  }
  async update(filter: any, data: any) {
    return this.prisma[this.model].update({
      where: filter,
      data,
    });
  }
  async remove(filter: any) {
    return this.prisma[this.model].delete({
      where: filter,
    });
  }
}
