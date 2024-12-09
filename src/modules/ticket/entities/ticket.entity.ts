import { TicketStatus } from '@prisma/client';
import { TicketClass } from '../../ticketClass/entities/ticketClass.entity';
import { OrderDetail } from '../../orderDetail/entities/orderDetail.entity';

export class Ticket {
  id: string;
  ticketClassId: string;
  ticketClass?: TicketClass;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  orderDetail?: OrderDetail | null;
}
