import { ConfigService } from '@nestjs/config';
import { EventService } from './event.service';
import dayjs from 'dayjs';

export class EventRecommendService {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventService: EventService,
  ) {}
  async getRecommendedEventsByEventId(eventId: string): Promise<Event[] | any> {
    const limit = 8;
    const event = await this.eventService.findEventById(eventId);
    if (event) {
      const sameCategoryEvents = await this.eventService.findMany({
        filter: {
          categories: {
            hasSome: event.categories,
          },
          status: 'published',
        },
        options: {
          take: 8,
          orderBy: {
            startDate: 'asc',
          },
        },
      });

      if (sameCategoryEvents.length === limit) {
        return sameCategoryEvents;
      }

      const remaining = limit - sameCategoryEvents.length;

      // Query additional events that are published and NOT in the same category.
      const otherCategoryEvents = await this.eventService.findMany({
        filter: {
          status: 'published',
          NOT: {
            categories: {
              hasSome: event.categories,
            },
          },
        },
        options: {
          take: remaining,
          orderBy: {
            startDate: 'asc',
          },
        },
      });
      return [...sameCategoryEvents, ...otherCategoryEvents];
    }
  }

  async getRecommendedEvents(
    at: string,
    limit: number,
  ): Promise<Event[] | any> {
    const today = new Date();
    if (at == 'this_week') {
      return await this.eventService.findMany({
        filter: {
          startDate: {
            gte: today,
            lte: dayjs().endOf('week').toDate(),
          },
          status: 'published',
        },
        options: {
          take: limit,
          orderBy: {
            startDate: 'asc',
          },
        },
      });
    } else if (at == 'this_month') {
      return await this.eventService.findMany({
        filter: {
          startDate: {
            gte: today,
            lte: dayjs().endOf('month').toDate(),
          },
          status: 'published',
        },
        options: {
          take: limit,
          orderBy: {
            startDate: 'asc',
          },
        },
      });
    }
  }
}
