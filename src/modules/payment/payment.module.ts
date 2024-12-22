import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
import { VnpayGateway } from './gateways/vnpay.gateway';
import { PaymentService } from './payment.service';
import { PaymentGatewayFactory } from './gateways/gateway.factory';
import { PaymentController } from './payment.controller';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    TransactionModule,
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secureSecret: configService.getOrThrow<string>('VNP_SECURE_SECRET'),
        tmnCode: configService.getOrThrow<string>('VNP_TMN_CODE'),
        loggerFn: ignoreLogger,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, VnpayGateway, PaymentGatewayFactory],
  exports: [PaymentService],
})
export class PaymentModule {}
