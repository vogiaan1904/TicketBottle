import { ApiPost } from '@/decorators/apiPost.decorator';
import { NoApplyResInterceptor } from '@/decorators/apiResponseMessage.decorator';
import { RequestWithUser } from '@/types/request.type';
import { Body, Controller, Get, Injectable, Query, Req } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CreateTestPaymentLinkDto } from '../order/dto/create-test-payment-link.dto';
import { GatewayName } from './enums/gatewayName';
import { PaymentService } from './payment.service';

@Injectable()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiPost({ path: 'test/create-payment-link' })
  async testCreatePaymentLink(
    @Req() req: RequestWithUser,
    @Body() dto: CreateTestPaymentLinkDto,
  ) {
    return this.paymentService.createPaymentLink(dto.gateway, {
      ip: req.ip,
      orderCode: Date.now().toString(32),
      amount: dto.amount,
      returnUrl: 'https://b4d5-27-2-114-140.ngrok-free.app/payment/vnpay/ipn',
    });
  }

  @ApiExcludeEndpoint(true)
  @NoApplyResInterceptor()
  @Get('vnpay/ipn')
  async vnpayIPN(@Query() query: any) {
    return await this.paymentService.handleCallback(GatewayName.VNPAY, query);
  }
}
