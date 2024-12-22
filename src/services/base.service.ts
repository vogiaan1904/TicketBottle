import { DatabaseService } from '../modules/database/database.service';
import { BaseServiceInterface } from './interfaces/base.interface';
import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';

const paginate: PaginatorTypes.PaginateFunction = paginator({
  page: 1,
  perPage: 10,
});

export abstract class BaseService<T> implements BaseServiceInterface<T> {
  constructor(
    private prisma: DatabaseService,
    private model: string,
    private responseDto: any,
  ) {}

  async findMany(args?: { filter?: any; options?: any }) {
    const { filter, options } = args;
    const data = await this.prisma[this.model].findMany({
      where: filter,
      ...options,
    });
    return data.map((item: any) => new this.responseDto(item));
  }

  async findManyWithPagination({
    filter,
    orderBy,
    page,
    perPage,
    options,
  }: {
    filter?: any;
    orderBy?: any;
    page?: number;
    perPage?: number;
    options?: any;
  }) {
    const response = await paginate(
      this.prisma[this.model],
      {
        where: filter,
        orderBy,
        ...options,
      },
      {
        page,
        perPage,
      },
    );
    return {
      ...response.meta,
      data: response.data.map((item: any) => new this.responseDto(item)),
    };
  }

  async findOne(filter: any, options?: any) {
    const entity = await this.prisma[this.model].findUnique({
      where: filter,
      ...options,
    });
    if (!entity) {
      return null;
    }
    return new this.responseDto(entity);
  }

  async create(data: any, options?: any) {
    return new this.responseDto(
      await this.prisma[this.model].create({
        data,
        ...options,
      }),
    );
  }

  async update(filter: any, data: any, options?: any) {
    return new this.responseDto(
      await this.prisma[this.model].update({
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
