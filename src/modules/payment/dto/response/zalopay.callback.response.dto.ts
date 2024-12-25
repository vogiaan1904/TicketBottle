import { BaseCallbackResponseDto } from './base.callback.response.dto';
export class ZalopayCallbackResponseDto extends BaseCallbackResponseDto {
  response: {
    return_code: number;
    return_message: string;
  };
  success: boolean;
  orderCode?: string;
}
