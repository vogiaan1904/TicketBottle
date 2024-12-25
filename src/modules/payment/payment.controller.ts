import { ApiPost } from '@/decorators/apiPost.decorator';
import { NoApplyResInterceptor } from '@/decorators/apiResponseMessage.decorator';
import { RequestWithUser } from '@/types/request.type';
import { Body, Controller, Get, Injectable, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateTestPaymentLinkDto } from '../order/dto/create-test-payment-link.dto';
import { GatewayName } from './enums/gatewayName';
import { PaymentService } from './payment.service';

@Injectable()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @ApiPost({ path: 'test/create-payment-link' })
  async testCreatePaymentLink(
    @Req() req: RequestWithUser,
    @Body() dto: CreateTestPaymentLinkDto,
  ) {
    const host =
      this.configService.get<string>(`NODE_ENV`) === 'production'
        ? `${req.protocol}://${req.get('host')}`
        : this.configService.get<string>(`NGROK_TEST_URL`);

    return this.paymentService.createPaymentLink(dto.gateway, {
      ip: req.ip,
      orderCode: Date.now().toString(32),
      amount: dto.amount,
      returnUrl: dto.returnUrl,
      host,
    });
  }

  @ApiExcludeEndpoint(true)
  @NoApplyResInterceptor()
  @Get('vnpay/ipn')
  async vnpayIPN(@Req() req: Request) {
    return await this.paymentService.handleCallback(GatewayName.VNPAY, {
      data: req.query,
      host: `${req.protocol}://${req.get('host')}`,
    });
  }

  @ApiExcludeEndpoint(true)
  @NoApplyResInterceptor()
  @ApiPost({ path: 'zalopay/callback' })
  async zalopayCallback(@Req() req: Request) {
    return await this.paymentService.handleCallback(GatewayName.ZALOPAY, {
      data: req.body,
      host: `${req.protocol}://${req.get('host')}`,
    });
  }
}
