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
    const callBackResponse = await gateway.handleCallback(callbackData.data);

    if (callBackResponse.success && callBackResponse.data) {
      await this.handleSucessPayment(callBackResponse.data.vnp_TxnRef);
    }
    return callBackResponse.response;
  }
}
