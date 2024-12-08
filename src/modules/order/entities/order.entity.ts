import { Prisma } from '@prisma/client';
import { User } from '../../user/entities/user.entity';
import { OrderDetail } from '../../orderDetail/entities/orderDetail.entity';

export class Order {
  id: string;
  userId: string;
  user?: User;
  eventId: string;
  numberOfTickets: number;
  orderDetails?: OrderDetail[];
  totalCheckOut: number;
  transactionData: Prisma.JsonValue;
  email: string;
  createdAt: Date;
}
