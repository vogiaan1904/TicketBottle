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
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { VnpayService } from 'nestjs-vnpay';
import {
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
  ReturnQueryFromVNPay,
  VerifyReturnUrl,
} from 'vnpay';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access/jwt-user-access-token.guard';
import { PaymentService } from '../payment/payment.service';
import { CreateOrderRedisDto } from './dto/create-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';
import { OrderService } from './order.service';

@Injectable()
@Controller('order')
export class OrderController {
  private readonly returnUrl: string;
  constructor(
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
    private readonly vnpayService: VnpayService,
    private readonly paymentService: PaymentService,
  ) {
    this.returnUrl = configService.get<string>('VNP_RETURN_URL');
  }

  @Post()
  @UseGuards(JwtAccessTokenGuard)
  @ApiCreatedResponse({ type: OrderResponseDto })
  async create(
    @Req() request: RequestWithUser,
    @Body() createOrderDto: CreateOrderRedisDto,
  ) {
    const host =
      this.configService.get<string>(`NODE_ENV`) === 'production'
        ? `${request.protocol}://${request.get('host')}`
        : this.configService.get<string>(`NGROK_TEST_URL`);

    return await this.orderService.createOrderOnRedis(
      request.user.id,
      createOrderDto,
      { ip: request.ip, host },
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
