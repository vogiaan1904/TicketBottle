import { Injectable } from '@nestjs/common';
import { PaymentGatewayFactory } from './gateways/gateway.factory';
import { CreatePaymentLinkOptions } from './interfaces/paymentGateway.interface';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentGatewayFactory: PaymentGatewayFactory) {}

  async createPaymentLink(gatewayType: string, dto: CreatePaymentLinkOptions) {
    const gateway = this.paymentGatewayFactory.getGateway(gatewayType);
    const url = await gateway.createPaymentLink(dto);

    return { url };
  }

  async handleCallback(gatewayType: string, query: any) {
    const gateway = this.paymentGatewayFactory.getGateway(gatewayType);
    const data = await gateway.handleCallback(query);
    console.log('done', data);
    return data.response;
  }
}
