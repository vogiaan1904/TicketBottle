import { BaseService } from '@/services/base.service';
import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { TransactionQueue } from './enum/queue';
import { Queue } from 'bullmq';

@Injectable()
export class TransactionService extends BaseService<Transaction> {
  private readonly JOB_NAME_PREFIX = 'transaction';
  private readonly PROCESS_JOB_NAME = this.JOB_NAME_PREFIX + ':process';

  constructor(
    private readonly databaseService: DatabaseService,
    @InjectQueue(TransactionQueue.name)
    private readonly transactionQueue: Queue,
  ) {
    super(databaseService, 'transaction', TransactionService);
  }

  async addTransactionToQueue(transactionID: string): Promise<void> {
    await this.transactionQueue.add(this.PROCESS_JOB_NAME, { transactionID });
  }
}