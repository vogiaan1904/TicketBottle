import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { PaymentGatewayInterface } from '../interfaces/paymentGateway.interface';
let CachedPayOS: any = null;

@Injectable()
export class PayOSGateway implements PaymentGatewayInterface {
  private readonly ORDER_TIMEOUT_MINUTES = 10;
  private readonly logger = new Logger(PayOSGateway.name);
  private payOSInstance: any;
  private initPayOSPayCallbackRes(code: number, message: string) {
    return {
      return_code: 1,
      return_message: message,
    };
  }
  constructor(private readonly configService: ConfigService) {}

  private async getPayOSModule(): Promise<any> {
    if (!CachedPayOS) {
      const module = await import('@payos/node');
      // Use the default export if it exists, otherwise use the module itself.
      CachedPayOS = module.default ?? module;
    }
    return CachedPayOS;
  }

  private async getPayOSInstance(): Promise<any> {
    if (!this.payOSInstance) {
      const PayOS = await this.getPayOSModule();
      this.payOSInstance = new PayOS(
        this.configService.get<string>('PAYOS_CLIENT_ID'),
        this.configService.get<string>('PAYOS_API_KEY'),
        this.configService.get<string>('PAYOS_CHECKSUM'),
      );
    }
    return this.payOSInstance;
  }

  async createPaymentLink(dto: any): Promise<string> {
    const payOS = await this.getPayOSInstance();
    const expDate = new Date();
    expDate.setMinutes(expDate.getMinutes() + this.ORDER_TIMEOUT_MINUTES);
    const expiredAt = Math.floor(expDate.getTime() / 1000);
    const res: CheckoutResponseDataType = await payOS.createPaymentLink({
      orderCode: +dto.orderCode,
      amount: dto.amount,
      description: dto.description || 'Thanh toan don hang',
      cancelUrl: dto.returnUrl,
      returnUrl: dto.returnUrl,
      expiredAt,
    });

    await payOS.confirmWebhook(dto.host + '/payment/payos/callback');

    return res.checkoutUrl;
  }

  async handleCallback(data: any): Promise<any> {
    const payOS = await this.getPayOSInstance();
    const webhookData = await payOS.verifyPaymentWebhookData(data);

    return {
      success: true,
      orderCode: webhookData.orderCode,
      response: this.initPayOSPayCallbackRes(1, 'Success'),
    };
  }
}
