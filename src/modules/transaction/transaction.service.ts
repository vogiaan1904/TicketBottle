import { BaseService } from '@/services/base/base.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';
import { OrderService } from '../order/order.service';
// import cryptoRandomString from 'crypto-random-string';

@Injectable()
export class TransactionService extends BaseService<Transaction> {
  readonly genRedisKey = {
    order: (orderId: string) => `order:${orderId}`,
  };
  private generateTemporaryId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  constructor(
    private readonly databaseService: DatabaseService,

    @InjectRedis() private readonly redis: Redis,
  ) {
    super(databaseService, 'transaction', TransactionService);
  }

  // generateTransactionCode(): number {
  //   const expDate = new Date();
  //   const formattedDate = `${expDate.getFullYear().toString().slice(2)}${(expDate.getMonth() + 1).toString().padStart(2, '0')}${expDate.getDate().toString().padStart(2, '0')}`;
  //   const randomString = cryptoRandomString({ length: 10, type: 'numeric' });
  //   return parseInt(`${formattedDate}${randomString}`);
  // }
}
