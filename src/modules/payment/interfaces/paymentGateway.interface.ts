export interface CreatePaymentLinkOptions {
  ip: string;
  amount: number;
  orderCode: string;
  returnUrl: string;
}

export interface PaymentGatewayInterface {
  createPaymentLink(dto: CreatePaymentLinkOptions): Promise<string>;
  handleCallback(query: any): Promise<any>;
}
