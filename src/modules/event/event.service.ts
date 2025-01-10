import { BaseService } from '@/services/base/base.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Event } from '@prisma/client';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { DatabaseService } from 'src/modules/database/database.service';
import { UpdateEventInfoRequestDto } from '../event-info/dto/update-event-info.request.dto';
import { OrganizerService } from '../organizer/organizer.service';
import { CreateTicketClassRequestDto } from '../ticket-class/dto/create-ticketClass.request.dto';
import { TicketClassService } from '../ticket-class/ticket-class.service';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import { EventResponseDto } from './dto/event.response.dto';
import { GetEventQueryRequestDto } from './dto/get-eventQuery.request.dto';
import { UpdateStaffPasswordRequestDto } from './dto/update-staffPassword.request.dto';
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
  private readonly logger = new Logger(EventService.name);
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

  async createInfo(id: string, data: CreateEventInfoRequestDto) {
    const { organizerId, ...eventInfoData } = data;
    const foundOrganizer = await this.organizerService.findOne({
      id: organizerId,
    });
    if (!foundOrganizer) {
      throw new BadRequestException('Organizer not found');
    }
    return await super.update(
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
  }

  async updateEventInfo(eventId: string, data: UpdateEventInfoRequestDto) {
    const foundEvent = await this.findOne(
      { eventId },
      { include: this.includeInfo },
    );
    if (!foundEvent.eventInfo) {
      throw new NotFoundException('Event Info not found');
    }
    return await this.update(
      { id: eventId },
      { eventInfo: { update: data } },
      { include: this.includeInfo },
    );
  }

  async createTicketClass(id: string, data: CreateTicketClassRequestDto) {
    return await super.update(
      { id },
      {
        ticketClasses: {
          create: data,
        },
      },
      { include: this.includeTicketClasses },
    );
  }

  async findEvents(dto: GetEventQueryRequestDto) {
    const { page, perPage, includeInfo } = dto;

    if (includeInfo === 'true') {
      return await super.findManyWithPagination({
        page,
        perPage,
        options: { include: this.includeInfo },
      });
    }
    return await super.findManyWithPagination({ page, perPage });
  }

  async findEventById(id: string) {
    return await super.findOne({ id }, { include: { ...this.includeInfo } });
  }

  async getTicketClasses(id: string) {
    return this.ticketClassService.findTicketClassesByEventId(id);
  }

  async updateStaffPassword(
    id: string,
    newPassword: UpdateStaffPasswordRequestDto,
  ) {
    return await super.update(
      { id },
      { staffPassword: newPassword.newPassword },
    );
  }

  // Dashboard for admin
  async findUpComingEvents(dto: GetEventQueryRequestDto) {
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

  async findMostSoldEvents(dto: GetEventQueryRequestDto) {
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

  async invalidateEventStatisticsCache(eventId: string) {
    const cacheKey = this.genRedisKey.eventStatistics(eventId);
    try {
      await this.cacheService.del(cacheKey);
      this.logger.log(`Invalidated cache for ${cacheKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for ${cacheKey}: ${error.message}`,
      );
    }
  }

  async getStatistics(eventId: string): Promise<EventStatisticsInterface> {
    const cacheKey = this.genRedisKey.eventStatistics(eventId);

    try {
      const cachedStatistics =
        await this.cacheService.get<EventStatisticsInterface>(cacheKey);
      if (cachedStatistics) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        return cachedStatistics;
      }
      this.logger.log(`Cache miss for ${cacheKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve cache for ${cacheKey}: ${error.message}`,
      );
    }
    const statistics = await this.computeStatistics(eventId);
    try {
      await this.cacheService.set(cacheKey, statistics, 600000); // Cache for 10 minutes
      this.logger.log(`Cached statistics for ${cacheKey}`);
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
