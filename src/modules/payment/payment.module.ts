import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
import { TransactionQueue } from './enums/queue';
import { PaymentGatewayFactory } from './gateways/gateway.factory';
import { VnpayGateway } from './gateways/vnpay.gateway';
import { ZalopayGateWay } from './gateways/zalopay.gateway';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    HttpModule,
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secureSecret: configService.getOrThrow<string>('VNP_SECURE_SECRET'),
        tmnCode: configService.getOrThrow<string>('VNP_TMN_CODE'),
        loggerFn: ignoreLogger,
      }),
      inject: [ConfigService],
    }),

    //transaction queue
    BullModule.registerQueue({
      name: TransactionQueue.name,
    }),
    BullBoardModule.forFeature({
      name: TransactionQueue.name,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    VnpayGateway,
    PaymentGatewayFactory,
    ZalopayGateWay,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
