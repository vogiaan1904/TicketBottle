import { GatewayName } from '../enums/gatewayName';
import { VnpayGateway } from './vnpay.gateway';
// src/payment/gateways/payment-gateway.factory.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentGatewayFactory {
  constructor(private readonly vnpayGateway: VnpayGateway) {}

  getGateway(gatewayType: string) {
    switch (gatewayType) {
      case GatewayName.VNPAY:
        return this.vnpayGateway;
      default:
        throw new Error(`Unsupported gateway: ${gatewayType}`);
    }
  }
}
