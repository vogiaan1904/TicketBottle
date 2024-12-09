export interface BaseServiceInterface<T> {
  findMany(): Promise<T[]>;
  findOne(filter: any): Promise<T>;
  create(data: any): Promise<T>;
  update(filter: any, data: any): Promise<T>;
  remove(filter: any): Promise<T>;
}
