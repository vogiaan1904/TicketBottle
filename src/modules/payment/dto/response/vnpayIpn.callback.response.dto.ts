import { IpnResponse } from 'vnpay/lib/constants/ipn-result-for-vnpay.constant';
import { BaseCallbackResponseDto } from './base.callback.response.dto';
import { VerifyReturnUrl } from 'vnpay';
export class VnpayIpnResponseDto extends BaseCallbackResponseDto {
  response: IpnResponse;
  data?: VerifyReturnUrl;
}
