export enum SORT_TYPE {
  'DESC' = 'desc',
  'ASC' = 'acs',
}

export type FindAllResponse<T> = { count: number; items: T[] };

export type FindManyResponse<T> = {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
};

export type SortParams = { sort_by: string; sort_type: SORT_TYPE };

export type SearchParams = { keyword: string; field: string };

export type PaginateParams = { offset: number; limit: number };
