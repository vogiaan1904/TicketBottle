import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { EventService } from './event.service';
import { GetRecommendedQueryDto } from './dto/get-event.query.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventRecommendService {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventService: EventService,
  ) {}
  async getRecommendedEventsByEventId(
    eventId: string,
    limit: number,
  ): Promise<Event[] | any> {
    const event = await this.eventService.findEventById(eventId);
    if (event) {
      const sameCategoryEvents = await this.eventService.findMany({
        filter: {
          id: { not: eventId },
          categories: {
            hasSome: event.categories,
          },
          configStatus: 'PUBLISHED',
        },
        options: {
          take: 4,
          include: {
            eventInfo: true,
          },
        },
      });

      const remaining = limit - sameCategoryEvents.length;
      let otherCategoryEvents = [];

      if (remaining > 0) {
        // Query additional events that are published and NOT in the same category.
        otherCategoryEvents = await this.eventService.findMany({
          filter: {
            configStatus: 'PUBLISHED',
            NOT: {
              categories: {
                hasSome: event.categories,
              },
            },
          },
          options: {
            take: remaining,
            include: {
              eventInfo: true,
            },
          },
        });
      }

      return [...sameCategoryEvents, ...otherCategoryEvents];
    }
  }

  async getRecommendedEvents(
    query: GetRecommendedQueryDto,
  ): Promise<Event[] | any> {
    const { eventId, limit, at } = query;
    if (eventId) {
      return await this.getRecommendedEventsByEventId(eventId, limit);
    }
    const today = new Date();
    if (at == 'this_week') {
      return await this.eventService.findMany({
        filter: {
          eventInfo: {
            startDate: {
              gte: today,
              lte: dayjs().endOf('week').toDate(),
            },
          },
          configStatus: 'PUBLISHED',
        },
        options: {
          take: limit,
          orderBy: {
            startSellDate: 'desc',
          },
          include: {
            eventInfo: true,
          },
        },
      });
    } else if (at == 'this_month') {
      return await this.eventService.findMany({
        filter: {
          eventInfo: {
            startDate: {
              gte: today,
              lte: dayjs().endOf('month').toDate(),
            },
          },
          configStatus: 'PUBLISHED',
        },
        options: {
          take: limit,
          orderBy: {
            startSellDate: 'desc',
          },
          include: {
            eventInfo: true,
          },
        },
      });
    } else {
      return await this.eventService.findMany({
        filter: {
          configStatus: 'PUBLISHED',
        },
        options: {
          take: limit,
          orderBy: {
            startSellDate: 'desc',
          },
          include: {
            eventInfo: true,
          },
        },
      });
    }
  }
}
