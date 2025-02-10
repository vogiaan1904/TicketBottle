import { OnlyAdmin } from '@/decorators/require-staff-role.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { UpdateUserRequestDto } from './dto/update-user.request.dto';
import { UserService } from './user.service';
import { ApiPagination } from '@/decorators/apiPagination.decorator';
import { GetUsersQueryRequestDto } from './dto/get-users-query.request.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @OnlyAdmin()
  @Post()
  create(@Body() createUserDto: CreateUserRequestDto) {
    return this.userService.create({ ...createUserDto, isVerified: true });
  }

  @OnlyAdmin()
  @ApiPagination()
  @Get()
  findAll(@Query() query: GetUsersQueryRequestDto) {
    return this.userService.getAllUsers(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  // @Get(':id/orders')
  // findOrdersByUserId(@Param('id') id: string) {
  //   return this.orderService.findOrdersByUserId(id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserRequestDto) {
    return this.userService.update({ id }, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove({ id });
  }
}
