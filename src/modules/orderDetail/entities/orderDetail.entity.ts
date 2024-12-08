import { Order } from '../../order/entities/order.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';

export class OrderDetail {
  id: string;
  orderId: string;
  order?: Order;
  ticketId: string;
  ticket?: Ticket;
  price: number;
  createdAt: Date;
}
