import { logger } from '@/configs/winston.config';
import { BaseService } from '@/services/base/base.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event } from '@prisma/client';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { console } from 'inspector';
import { DatabaseService } from 'src/modules/database/database.service';
import { UpdateEventInfoRequestDto } from '../event-info/dto/update-event-info.request.dto';
import { OrganizerService } from '../organizer/organizer.service';
import { CreateTicketClassRequestDto } from '../ticket-class/dto/create-ticketClass.request.dto';
import { TicketClassService } from '../ticket-class/ticket-class.service';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import {
  EventResponseDto,
  EventsByCategoriesResponseDto,
} from './dto/event.response.dto';
import { GetEventsQueryDto } from './dto/get-event.query.dto';
import { UpdateEventRequestDto } from './dto/update-event.request.dto';
export interface EventStatisticsInterface {
  soldTickets: number;
  netRevenue: number;
  todaySoldTickets: number;
  todayRevenue: number;
  attendanceRate: number;
  statisticsPerClass: {
    ticketClassName: string;
    soldTickets: number;
    remainingTickets: number;
    netRevenue: number;
    todayRevenue: number;
    todaySoldTickets: number;
  }[];
}
@Injectable()
export class EventService extends BaseService<Event> {
  private readonly logger = logger.child({ context: EventService.name });
  private includeInfo = { eventInfo: true };
  private includeInfoAndOrganizer = {
    eventInfo: { include: { organizer: true } },
  };
  private includeTicketClasses = { ticketClasses: true };

  readonly genRedisKey = {
    eventStatistics: (eventId: string) => `eventStatistics:${eventId}`,
  };

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly ticketClassService: TicketClassService,
    private readonly organizerService: OrganizerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {
    super(databaseService, 'event', EventResponseDto);
  }

  async create(dto: CreateEventRequestDto, options?: any): Promise<Event> {
    console.log(dto);
    const event = await super.create(dto, options);
    return event;
  }
  async createInfo(id: string, data: CreateEventInfoRequestDto) {
    const { organizerId, ...eventInfoData } = data;
    const foundOrganizer = await this.organizerService.findOne({
      id: organizerId,
    });
    if (!foundOrganizer) {
      this.logger.error(`Organizer with id ${organizerId} not found`);
      throw new BadRequestException('Failed to create event info');
    }
    try {
      const upatedEvent = await super.update(
        { id },
        {
          eventInfo: {
            create: {
              ...eventInfoData,
              organizer: {
                connect: {
                  id: organizerId,
                },
              },
            },
          },
        },
        { include: this.includeInfoAndOrganizer },
      );

      return upatedEvent.eventInfo;
    } catch (error) {
      this.logger.error(error);
      console.log(error);
      throw new BadRequestException('Failed to create event info');
    }
  }
  async updateEvent(id: string, data: UpdateEventRequestDto) {
    const event = await super.update({ id }, data);
    return event;
  }

  async updateEventInfo(id: string, data: UpdateEventInfoRequestDto) {
    const foundEvent = await this.findOne(
      { id },
      { include: this.includeInfo },
    );
    if (!foundEvent.eventInfo) {
      throw new NotFoundException('Event Info not found');
    }
    const updatedEventInfo = await this.update(
      { id },
      { eventInfo: { update: data } },
      { include: this.includeInfoAndOrganizer },
    );
    return updatedEventInfo.eventInfo;
  }

  async createTicketClass(id: string, data: CreateTicketClassRequestDto) {
    try {
      return await super.update(
        { id },
        {
          ticketClasses: {
            create: data,
          },
        },
        { include: this.includeTicketClasses },
      );
    } catch (error) {
      this.logger.error(error);
      console.log(error);
      throw new BadRequestException('Failed to create ticket class');
    }
  }

  async findEvents(dto: GetEventsQueryDto) {
    const { page, perPage, categories, from, to, isFree, q } = dto;
    const filter: any = {};
    const eventInfoFilter: any = {};
    if (categories) {
      filter.categories = {
        hasEvery: categories,
      };
    }
    if (from && to) {
      eventInfoFilter.startDate = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    if (q) {
      const qFilter = {
        OR: [
          {
            name: { contains: q, mode: 'insensitive' },
          },
          {
            description: { contains: q, mode: 'insensitive' },
          },
        ],
      };

      eventInfoFilter.AND = eventInfoFilter.AND
        ? [...eventInfoFilter.AND, qFilter]
        : [qFilter];
    }

    if (Object.keys(eventInfoFilter).length > 0) {
      filter.eventInfo = eventInfoFilter;
    }

    if (isFree) {
      filter.isFree = Boolean(isFree);
    }

    return await super.findManyWithPagination({
      filter,
      page,
      perPage,
      options: { include: this.includeInfo },
    });
  }

  async getEventsByAllCategories(): Promise<EventsByCategoriesResponseDto> {
    const today = new Date();

    const musicEvents = await this.findMany({
      filter: {
        categories: {
          has: 'MUSIC',
        },
        eventInfo: {
          startDate: {
            gte: today,
          },
        },
      },
      options: {
        take: 10,
        orderBy: {
          eventInfo: {
            startDate: 'asc',
          },
        },
        include: this.includeInfo,
      },
    });

    const theatersAndArtEvents = await this.findMany({
      filter: {
        categories: {
          has: 'THEATERS_AND_ART',
        },
        eventInfo: {
          startDate: {
            gte: today,
          },
        },
      },
      options: {
        take: 10,
        orderBy: {
          eventInfo: {
            startDate: 'asc',
          },
        },
        include: this.includeInfo,
      },
    });

    const sportEvents = await this.findMany({
      filter: {
        categories: {
          has: 'SPORT',
        },
        eventInfo: {
          startDate: {
            gte: today,
          },
        },
      },
      options: {
        take: 10,
        orderBy: {
          eventInfo: {
            startDate: 'asc',
          },
        },
        include: this.includeInfo,
      },
    });

    const otherEvents = await this.findMany({
      filter: {
        categories: {
          has: 'OTHER',
        },
        eventInfo: {
          startDate: {
            gte: today,
          },
        },
      },
      options: {
        take: 10,
        orderBy: {
          eventInfo: {
            startDate: 'asc',
          },
        },
        include: this.includeInfo,
      },
    });

    const trendingEvents = await this.findMany({
      filter: {
        status: 'PUBLISHED',
        eventInfo: {
          startDate: {
            gte: today,
          },
        },
      },
      options: {
        take: 10,
        orderBy: {
          tickets: {
            _count: 'desc',
          },
        },
        include: this.includeInfo,
      },
    });
    return {
      musicEvents,
      theatersAndArtEvents,
      sportEvents,
      otherEvents,
      trendingEvents,
    };
  }

  async findEventById(id: string) {
    return await super.findOne({ id }, { include: { ...this.includeInfo } });
  }

  async getTicketClasses(id: string) {
    return this.ticketClassService.findTicketClassesByEventId(id);
  }

  async deleteEvent(id: string) {
    const event = await this.findOne({ id });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return await super.remove({ id });
  }

  // Dashboard for admin
  async findUpComingEvents(dto: GetEventsQueryDto) {
    const { page, perPage } = dto;

    return await super.findManyWithPagination({
      filter: {
        startSellDate: {
          gt: new Date(),
        },
      },
      orderBy: {
        startSellDate: 'asc',
      },
      page,
      perPage,
      options: {
        select: { id: true, ...this.includeInfo },
      },
    });
  }

  async findMostSoldEvents(dto: GetEventsQueryDto) {
    const { page, perPage } = dto;
    return await super.findManyWithPagination({
      filter: {
        status: 'PUBLISHED',
      },
      orderBy: {
        tickets: {
          _count: 'desc',
        },
      },
      page,
      perPage,
      options: {
        select: {
          id: true,
          ...this.includeInfo,
          _count: {
            select: { tickets: true },
          },
        },
      },
    });
  }
  // Dashboard for staffs of an event

  async invalidateEventStatisticsCache(id: string) {
    const cacheKey = this.genRedisKey.eventStatistics(id);
    try {
      await this.cacheService.del(cacheKey);
      this.logger.info(`Invalidated cache for ${cacheKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for ${cacheKey}: ${error.message}`,
      );
    }
  }

  async getStatistics(id: string): Promise<EventStatisticsInterface> {
    const cacheKey = this.genRedisKey.eventStatistics(id);

    try {
      const cachedStatistics =
        await this.cacheService.get<EventStatisticsInterface>(cacheKey);
      if (cachedStatistics) {
        this.logger.info(`Cache hit for ${cacheKey}`);
        return cachedStatistics;
      }
      this.logger.info(`Cache miss for ${cacheKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve cache for ${cacheKey}: ${error.message}`,
      );
    }
    const statistics = await this.computeStatistics(id);
    try {
      await this.cacheService.set(cacheKey, statistics, 600000); // Cache for 10 minutes
      this.logger.info(`Cached statistics for ${cacheKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to set cache for ${cacheKey}: ${error.message}`,
      );
      // Return statistics even if caching fails
    }
    return statistics;
  }

  private async computeStatistics(
    eventId: string,
  ): Promise<EventStatisticsInterface> {
    const ticketClasses = await this.ticketClassService.findMany({
      filter: { eventId },
      options: {
        select: {
          name: true,
          price: true,
          soldQuantity: true,
          totalQuantity: true,
          tickets: true,
        },
      },
    });

    // Calculate statistics for each class
    const statisticsPerClass = ticketClasses.map((ticketClass) => {
      const startOfToday = dayjs().startOf('day');
      const { checkInCount, todaySoldTickets } = ticketClass.tickets.reduce(
        (acc, curr) => {
          if (curr.isCheckIn) {
            acc.checkInCount += 1;
          }
          if (curr.createdAt >= startOfToday) {
            acc.todaySoldTickets += 1;
          }
          return acc;
        },
        { checkInCount: 0, todaySoldTickets: 0 },
      );

      const attendanceRate = ticketClass.soldQuantity
        ? (checkInCount / ticketClass.soldQuantity) * 100
        : 0;

      return {
        ticketClassName: ticketClass.name,
        soldTickets: ticketClass.soldQuantity,
        remainingTickets: ticketClass.totalQuantity - ticketClass.soldQuantity,
        attendanceRate: attendanceRate,
        netRevenue: ticketClass.price * ticketClass.soldQuantity,
        todaySoldTickets: todaySoldTickets,
        todayRevenue: ticketClass.price * todaySoldTickets,
      };
    });

    // Calculate total statistics for the event
    const {
      soldTickets,
      netRevenue,
      todaySoldTickets,
      todayRevenue,
      attendanceRate,
    } = statisticsPerClass.reduce(
      (acc, curr) => {
        acc.soldTickets += curr.soldTickets;
        acc.netRevenue += curr.netRevenue;
        acc.attendanceRate += curr.attendanceRate;
        acc.todaySoldTickets += curr.todaySoldTickets;
        acc.todayRevenue += curr.todayRevenue;
        return acc;
      },
      {
        soldTickets: 0,
        netRevenue: 0,
        attendanceRate: 0,
        todaySoldTickets: 0,
        todayRevenue: 0,
      },
    );

    return {
      soldTickets,
      netRevenue,
      attendanceRate,
      todaySoldTickets,
      todayRevenue,
      statisticsPerClass,
    };
  }
}
