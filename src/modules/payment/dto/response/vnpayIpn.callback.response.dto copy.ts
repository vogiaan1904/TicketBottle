import { IpnResponse } from 'vnpay/lib/constants/ipn-result-for-vnpay.constant';
import { BaseCallbackResponseDto } from './base.callback.response.dto';
export class VnpayIpnResponseDto extends BaseCallbackResponseDto {
  response: IpnResponse;
}
