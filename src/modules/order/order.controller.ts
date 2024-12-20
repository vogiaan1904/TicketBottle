import { RequestWithUser } from '@/types/request.type';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access/jwt-user-access-token.guard';
import { CreateOrderRedisDto } from './dto/create-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAccessTokenGuard)
  @ApiCreatedResponse({ type: OrderResponseDto })
  create(
    @Req() request: RequestWithUser,
    @Body() createOrderDto: CreateOrderRedisDto,
  ) {
    return this.orderService.createOrderOnRedis(
      request.user.id,
      createOrderDto,
    );
  }

  @Post(':id/cancel')
  @UseGuards(JwtAccessTokenGuard)
  @ApiCreatedResponse({ type: OrderResponseDto })
  cancel(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Get(':id')
  @UseGuards(JwtAccessTokenGuard)
  @ApiOkResponse({ type: OrderResponseDto })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne({ id });
  }
}
