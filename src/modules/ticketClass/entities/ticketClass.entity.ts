import { Event } from '../../event/entities/event.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';

export class TicketClass {
  id: string;
  name: string;
  description: string;
  price: number;
  eventId: string;
  event?: Event;
  tickets?: Ticket[];
}
