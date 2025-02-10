import { RequestWithUser } from '@/types/request.type';
import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access/jwt-user-access-token.guard';
import { CreateOrderRedisDto } from './dto/create-order.request.dto';
import {
  OrderCheckoutResponseDto,
  OrderResponseDto,
  OrderStatisticsReponseDto,
} from './dto/order.response.dto';
import { OrderService } from './order.service';
import { ApiPost } from '@/decorators/apiPost.decorator';
import { GetOrdersQueryRequestDto } from './dto/get-orders-query.request.dto';
import { OnlyAdmin } from '@/decorators/require-staff-role.decorator';

@Injectable()
@Controller('order')
export class OrderController {
  private readonly returnUrl: string;
  constructor(
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
  ) {}

  @ApiPost({ path: '' })
  @UseGuards(JwtAccessTokenGuard)
  @ApiCreatedResponse({ type: OrderCheckoutResponseDto })
  async create(
    @Req() request: RequestWithUser,
    @Body() createOrderDto: CreateOrderRedisDto,
  ) {
    const host =
      this.configService.get<string>(`NODE_ENV`) === 'production'
        ? `https://${request.get('host')}`
        : this.configService.get<string>(`NGROK_TEST_URL`);

    return await this.orderService.checkout(request.user.id, createOrderDto, {
      ip: request.ip,
      host,
    });
  }

  @Post(':id/cancel')
  @UseGuards(JwtAccessTokenGuard)
  @ApiCreatedResponse({ type: OrderResponseDto })
  cancel(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Get('/my-orders')
  @UseGuards(JwtAccessTokenGuard)
  @ApiOkResponse({ type: OrderResponseDto, isArray: true })
  getMyOrders(
    @Req() request: RequestWithUser,
    @Query() query: GetOrdersQueryRequestDto,
  ) {
    return this.orderService.getOrdersByUserId(request.user.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAccessTokenGuard)
  @ApiOkResponse({ type: OrderResponseDto })
  findOne(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @OnlyAdmin()
  @Get(':eventId/statistics')
  @ApiOkResponse({ type: OrderStatisticsReponseDto, isArray: true })
  getStatisticsByEventId(
    @Param('eventId') eventId: string,
    @Query() dto: GetOrdersQueryRequestDto,
  ) {
    return this.orderService.getOrdersStatisticByEventId(eventId, dto);
  }
}
