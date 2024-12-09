import { EventStatus } from '@prisma/client';
import { EventInfo } from '../../eventInfo/entities/eventInfo.entity';
import { TicketClass } from '../../ticketClass/entities/ticketClass.entity';

export class Event {
  id: string;
  numberOfTickets: number;
  startSellDate: Date;
  endSellDate: Date;
  isFree: boolean;
  maxTicketsPerOrder: number;
  status: EventStatus;
  staffUsername: string;
  eventInfo?: EventInfo | null;
  ticketClasses?: TicketClass[];
  createdAt: Date;
  updatedAt: Date;
}
