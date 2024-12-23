export interface CreatePaymentLinkOptions {
  ip: string;
  amount: number;
  orderCode: string;
  returnUrl: string;
  host: string;
}

export interface CallbackData {
  data: object;
  host: string;
}

export interface PaymentGatewayInterface {
  createPaymentLink(dto: CreatePaymentLinkOptions): Promise<string>;
  handleCallback(query: any): Promise<any>;
}
