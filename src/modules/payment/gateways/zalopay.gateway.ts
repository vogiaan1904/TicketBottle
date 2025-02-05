import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { PaymentGatewayInterface } from '../interfaces/paymentGateway.interface';
import { ZalopayCallbackResponseDto } from '../dto/response/zalopay.callback.response.dto';

interface ZaloPayRequestConfigInterface {
  amount: number;
  description: string;
  orderCode: string;
  returnUrl: string;
  host: string;
}

@Injectable()
export class ZalopayGateWay implements PaymentGatewayInterface {
  private readonly logger = new Logger(ZalopayGateWay.name);
  private readonly ORDER_TIMEOUT_MINUTES = 10;
  private readonly CREATE_ZALOPAY_PAYMENT_LINK_URL =
    'https://sb-openapi.zalopay.vn/v2/create';
  private readonly appID: number;
  private readonly key1: string;
  private readonly key2: string;
  private readonly callbackErrorCode = -1;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.appID = this.configService.getOrThrow<number>('ZALOPAY_APP_ID');
    this.key1 = this.configService.getOrThrow<string>('ZALOPAY_KEY1');
    this.key2 = this.configService.getOrThrow<string>('ZALOPAY_KEY2');
  }
  private initZaloPayCallbackRes(code: number, message: string) {
    return {
      return_code: 1,
      return_message: message,
    };
  }

  private initZaloPayRequestConfig(data: ZaloPayRequestConfigInterface) {
    const now = dayjs();
    const transID = now.format('YYMMDD');

    const config = {
      app_id: this.appID * 1,
      app_user: 'user123',
      app_time: now.valueOf(),
      amount: data.amount,
      app_trans_id: transID + '_' + data.orderCode,
      embed_data: JSON.stringify({
        preferred_payment_method: [],
        redirecturl: data.returnUrl,
      }),
      description: data.orderCode,
      bank_code: '',
      callback_url: data.host + '/payment/zalopay/callback',
      item: JSON.stringify([]),
      mac: '',
    };

    const macInput =
      config.app_id +
      '|' +
      config.app_trans_id +
      '|' +
      config.app_user +
      '|' +
      config.amount +
      '|' +
      config.app_time +
      '|' +
      config.embed_data +
      '|' +
      config.item;
    config.mac = crypto
      .createHmac('sha256', this.key1)
      .update(macInput)
      .digest('hex');

    return config;
  }

  async createPaymentLink(dto: any): Promise<string> {
    const data = this.initZaloPayRequestConfig(dto);
    const res: AxiosResponse = await this.httpService.axiosRef.post(
      this.CREATE_ZALOPAY_PAYMENT_LINK_URL,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (res.data.return_code !== 1) {
      throw new InternalServerErrorException('There was an error with Zalopay');
    }

    return res.data.order_url;
  }

  async handleCallback(callbackData: any): Promise<ZalopayCallbackResponseDto> {
    const requestMac = crypto
      .createHmac('sha256', this.key2)
      .update(callbackData.data)
      .digest('hex');
    if (requestMac !== callbackData.mac) {
      return {
        success: false,
        response: this.initZaloPayCallbackRes(
          this.callbackErrorCode,
          'Invalid mac',
        ),
      };
    }

    const transData = JSON.parse(callbackData.data);

    return {
      success: true,
      response: this.initZaloPayCallbackRes(1, 'Success'),
      orderCode: transData.app_trans_id.split('_')[1],
    };
  }
}
