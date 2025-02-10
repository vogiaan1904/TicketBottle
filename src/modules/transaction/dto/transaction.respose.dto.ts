import {
  Transaction,
  TransactionAction,
  TransactionStatus,
} from '@prisma/client';

export class TransactionResponseDto implements Transaction {
  constructor(partial: Partial<TransactionResponseDto>) {
    Object.assign(this, partial);
  }
  id: string;
  refCode: string;
  action: TransactionAction;
  gateway: string;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
  details: object;
}
