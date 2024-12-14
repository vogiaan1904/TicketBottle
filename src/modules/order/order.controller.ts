import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateOrderRequestDto } from './dto/create-order.request.dto';
import { UpdateOrderRequestDto } from './dto/update-order.request.dto';
import { OrderService } from './order.service';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { OrderResponseDto } from './dto/order.response.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiCreatedResponse({ type: OrderResponseDto })
  create(@Body() createOrderDto: CreateOrderRequestDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderResponseDto })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne({ id });
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrderResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderRequestDto,
  ) {
    return this.orderService.update({ id }, updateOrderDto);
  }
}
