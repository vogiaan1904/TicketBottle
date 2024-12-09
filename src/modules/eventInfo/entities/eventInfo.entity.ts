import { Event } from '../../event/entities/event.entity';

export class EventInfo {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  location: string;
  eventId: string;
  event?: Event;
}
