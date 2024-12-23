import { GatewayName } from '../enums/gatewayName';
import { VnpayGateway } from './vnpay.gateway';
// src/payment/gateways/payment-gateway.factory.ts
import { Injectable } from '@nestjs/common';
import { ZalopayGateWay } from './zalopay.gateway';

@Injectable()
export class PaymentGatewayFactory {
  constructor(
    private readonly vnpayGateway: VnpayGateway,
    private readonly zalopayGateWay: ZalopayGateWay,
  ) {}

  getGateway(gatewayType: string) {
    switch (gatewayType) {
      case GatewayName.VNPAY:
        return this.vnpayGateway;
      case GatewayName.ZALOPAY:
        return this.zalopayGateWay;
      default:
        throw new Error(`Unsupported gateway: ${gatewayType}`);
    }
  }
}
