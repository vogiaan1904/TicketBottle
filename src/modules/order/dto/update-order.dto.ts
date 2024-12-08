import { Prisma } from '@prisma/client';

export class UpdateOrderDto {
  eventId?: string;
  numberOfTickets?: number;
  totalCheckOut?: number;
  transactionData?: Prisma.InputJsonValue;
  email?: string;
}
