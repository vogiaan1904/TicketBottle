import { BaseService } from '@/services/base.service';
import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionService extends BaseService<Transaction> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'transaction', TransactionService);
  }
}
