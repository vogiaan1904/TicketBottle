import { Controller, Get } from '@nestjs/common';
import { Category } from '@prisma/client';

@Controller('category')
export class CategoryController {
  @Get()
  findAll() {
    return Category;
  }
}
