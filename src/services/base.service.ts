import { DatabaseService } from '../modules/database/database.service';
import { BaseServiceInterface } from './interfaces/base.interface';
export abstract class BaseService<T> implements BaseServiceInterface<T> {
  constructor(
    private prisma: DatabaseService,
    private model: string,
    private responseDto: any,
  ) {}

  async findMany(options?: any) {
    const data = await this.prisma[this.model].findMany(options);
    return data.map((item: any) => new this.responseDto(item));
  }

  async findOne(filter: any, options?: any) {
    return new this.responseDto(
      await this.prisma[this.model].findFirst({
        where: filter,
        ...options,
      }),
    );
  }

  async create(data: any) {
    return new this.responseDto(
      this.prisma[this.model].create({
        data,
      }),
    );
  }

  async update(filter: any, data: any, options?: any) {
    return new this.responseDto(
      this.prisma[this.model].update({
        where: filter,
        data,
        ...options,
      }),
    );
  }

  async remove(filter: any) {
    return new this.responseDto(
      this.prisma[this.model].delete({
        where: filter,
      }),
    );
  }
}
