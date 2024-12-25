export interface BaseServiceInterface<T> {
  findMany(args?: { filter?: any; options?: any }): Promise<T[]>;
  findManyWithPagination(
    filter?,
    orderBy?,
    page?,
    perPage?,
    options?,
  ): Promise<any>;
  findOne(filter: any): Promise<T>;
  create(data: any): Promise<T>;
  update(filter: any, data: any): Promise<T>;
  remove(filter: any): Promise<T>;
}
