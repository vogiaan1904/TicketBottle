import { Injectable } from '@nestjs/common';
import { PaymentGatewayFactory } from './gateways/gateway.factory';
import {
  CallbackData,
  CreatePaymentLinkOptions,
} from './interfaces/paymentGateway.interface';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly transactionService: TransactionService,
  ) {}

  private async handleSucessPayment(transID: string): Promise<void> {
    return await this.transactionService.addTransactionToQueue(transID);
  }

  async createPaymentLink(gatewayType: string, dto: CreatePaymentLinkOptions) {
    const gateway = this.paymentGatewayFactory.getGateway(gatewayType);
    const url = await gateway.createPaymentLink(dto);
    return { url };
  }

  async handleCallback(gatewayType: string, callbackData: CallbackData) {
    const gateway = this.paymentGatewayFactory.getGateway(gatewayType);

    const data = await gateway.handleCallback(callbackData.data);
    if (data.success) {
      await this.handleSucessPayment(data.orderCode); // For testing purpose
    }
    return data.response;
  }
}
