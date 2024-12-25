import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPagination() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false }),
    ApiQuery({ name: 'perPage', required: false }),
  );
}
