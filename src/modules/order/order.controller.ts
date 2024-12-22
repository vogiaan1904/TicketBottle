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
  dateFormat,
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
  ProductCode,
  ReturnQueryFromVNPay,
  VerifyReturnUrl,
  VnpLocale,
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
    const order = await this.orderService.createOrderOnRedis(
      request.user.id,
      createOrderDto,
    );
    const expDate = new Date();
    expDate.setMinutes(expDate.getMinutes() + 10);

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: Number(order.totalCheckout),
      vnp_IpAddr: Array.isArray(request.headers['x-forwarded-for'])
        ? request.headers['x-forwarded-for'][0]
        : request.headers['x-forwarded-for'] ||
          request.connection.remoteAddress ||
          request.socket.remoteAddress ||
          request.ip,
      vnp_TxnRef: order.id,
      vnp_OrderInfo: `Payment for order ${order.id}`,
      vnp_OrderType: ProductCode.Entertainment_Training,
      vnp_ReturnUrl: this.returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_ExpireDate: dateFormat(expDate),
    });
    return paymentUrl;
  }

  @Get('/vnpay-ipn')
  async verifyVnpayIPN(
    @Query() query: ReturnQueryFromVNPay,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const verify: VerifyReturnUrl =
        await this.vnpayService.verifyIpnCall(query);

      if (!verify.isVerified) {
        return response.json(IpnFailChecksum);
      }

      // Find the order in your database
      const foundOrder = await this.orderService.getOrderOnRedis(
        verify.vnp_TxnRef,
      ); // Method to find an order by id, you need to implement it

      // If the order is not found or the order code does not match
      if (!foundOrder || verify.vnp_TxnRef !== foundOrder.id) {
        return response.json(IpnOrderNotFound);
      }

      // If the payment amount does not match
      if (verify.vnp_Amount !== foundOrder.amount) {
        return response.json(IpnInvalidAmount);
      }

      // If the order has been confirmed before
      if (foundOrder.status === 'COMPLETED') {
        return response.json(InpOrderAlreadyConfirmed);
      }

      /**
       * After verifying the order is complete,
       * you can update the order status in your database
       */
      foundOrder.status = 'COMPLETED';
      await this.orderService.completeOrder(foundOrder.id); // Function to update the order status, you need to implement it

      // Then update the status back to VNPay to let them know that you have confirmed the order
      return response.json(IpnSuccess);
    } catch (error) {
      /**
       * Handle exceptions
       * For example, insufficient data, invalid data, database update failure
       */
      console.log(`verify error: ${error}`);
      return response.json(IpnUnknownError);
    }
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
