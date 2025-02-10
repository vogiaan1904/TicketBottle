import { ApiPost } from '@/decorators/apiPost.decorator';
import { NoApplyResInterceptor } from '@/decorators/apiResponseMessage.decorator';
import { Body, Controller, Get, Injectable, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { GatewayName } from './enums/gatewayName';
import { PaymentService } from './payment.service';

@Injectable()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @ApiPost({ path: 'test/procress' })
  @ApiBody({
    type: Object,
    examples: {
      code: {
        value: {
          code: 'test1a_123213',
        },
      },
    },
  })
  async testCreatePaymentLink(@Body() data: any) {
    return this.paymentService.addTransactionToQueue(data.code);
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

  @ApiExcludeEndpoint(true)
  @NoApplyResInterceptor()
  @ApiPost({ path: 'payos/callback' })
  async payosCallBack(@Req() req: Request) {
    return await this.paymentService.handleCallback(GatewayName.PAYOS, {
      data: req.body,
      host: `${req.protocol}://${req.get('host')}`,
    });
  }
}
