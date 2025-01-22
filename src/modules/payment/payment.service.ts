import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TransactionQueue } from './enums/queue';
import { PaymentGatewayFactory } from './gateways/gateway.factory';
import {
  CallbackData,
  CreatePaymentLinkOptions,
} from './interfaces/paymentGateway.interface';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    @InjectQueue(TransactionQueue.name)
    private readonly transactionQueue: Queue,
  ) {}
  // Transaction Queue
  private readonly JOB_NAME_PREFIX = 'transaction';
  private readonly PROCESS_JOB_NAME = this.JOB_NAME_PREFIX + ':process';

  private async handleSucessPayment(orderCode: string): Promise<void> {
    //check what type of payment
    return await this.addTransactionToQueue(orderCode);
  }

  // Transaction Queue
  async addTransactionToQueue(transactionID: string): Promise<void> {
    await this.transactionQueue.add(this.PROCESS_JOB_NAME, {
      transactionID,
    });
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
      await this.handleSucessPayment(data.orderCode);
    }
    return data.response;
  }
}
