import {
  Transaction,
  TransactionAction,
  TransactionStatus,
} from '@prisma/client';

export class TransactionResponseDto implements Transaction {
  id: string;
  refCode: string;
  action: TransactionAction;
  gateway: string;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
  details: object;
}
