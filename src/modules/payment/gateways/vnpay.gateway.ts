import { TransactionService } from '@/modules/transaction/transaction.service';
import { Injectable, Logger } from '@nestjs/common';
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
  VerifyReturnUrl,
  VnpLocale,
} from 'vnpay';
import {
  CreatePaymentLinkOptions,
  PaymentGatewayInterface,
} from '../interfaces/paymentGateway.interface';

import { VnpayIpnResponseDto } from '../dto/response/vnpayIpn.callback.response.dto copy';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class VnpayGateway implements PaymentGatewayInterface {
  private readonly logger = new Logger(VnpayGateway.name);
  private readonly ORDER_TIMEOUT_MINUTES = 10;
  readonly genRedisKey = {
    order: (orderId: string) => `order:${orderId}`,
  };
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly transactionService: TransactionService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async createPaymentLink(dto: CreatePaymentLinkOptions): Promise<string> {
    const expDate = new Date();
    expDate.setMinutes(expDate.getMinutes() + this.ORDER_TIMEOUT_MINUTES);

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: dto.amount,
      vnp_IpAddr: dto.ip,
      vnp_TxnRef: dto.orderCode,
      vnp_OrderInfo: `Thanh toan don hang ${dto.orderCode}`,

      vnp_OrderType: ProductCode.Entertainment_Training,
      vnp_ReturnUrl: dto.returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_ExpireDate: dateFormat(expDate),
      vnp_BankCode: 'VNBANK',
    });

    this.logger.log(`Payment URL for order ${dto.orderCode}: ${paymentUrl}`);
    return paymentUrl;
  }

  async handleCallback(query: any): Promise<VnpayIpnResponseDto> {
    try {
      const verify: VerifyReturnUrl =
        await this.vnpayService.verifyIpnCall(query);
      if (!verify.isVerified) {
        return {
          response: IpnFailChecksum,
          success: false,
        };
      }

      // Đoạnn này cần check trong Db/Redis xem có transaction nào tương ứng với refCode không
      //============
      const foundTrans = await this.redis.hgetall(
        this.genRedisKey.order(verify.vnp_TxnRef),
      );

      if (!foundTrans || verify.vnp_TxnRef !== foundTrans.code) {
        return {
          response: IpnOrderNotFound,
          success: false,
        };
      }

      if (verify.vnp_Amount !== foundTrans.amount) {
        return {
          response: IpnInvalidAmount,
          success: false,
        };
      }

      if (foundTrans.status === TransactionStatus.COMPLETED) {
        return {
          response: InpOrderAlreadyConfirmed,
          success: false,
        };
      }

      return {
        response: IpnSuccess,
        data: verify,
        success: true,
        orderCode: verify.vnp_TxnRef,
      };
    } catch (error) {
      this.logger.error('Vnpay IPN Unknow Error: ', error);
      console.error(error);
      return { response: IpnUnknownError, success: false };
    }
  }
}
