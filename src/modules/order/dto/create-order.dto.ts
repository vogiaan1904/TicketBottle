import { Prisma } from '@prisma/client';

export class CreateOrderDto {
  eventId: string;
  numberOfTickets: number;
  totalCheckOut: number;
  transactionData: Prisma.InputJsonValue;
  email: string;
}