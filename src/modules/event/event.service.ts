import { BaseService } from '@/services/base/base.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateTicketClassRequestDto } from '../ticket-class/dto/create-ticketClass.request.dto';
import { TicketClassService } from '../ticket-class/ticket-class.service';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import { EventResponseDto } from './dto/event.response.dto';
import { GetEventQueryRequestDto } from './dto/get-eventQuery.request.dto';
import { UpdateStaffPasswordRequestDto } from './dto/update-staffPassword.request.dto';
import { OrganizerService } from '../organizer/organizer.service';

@Injectable()
export class EventService extends BaseService<Event> {
  private includeInfo = { eventInfo: true };
  private includeInfoAndOrganizer = {
    eventInfo: { include: { organizer: true } },
  };

  private includeTicketClasses = { ticketClasses: true };
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly ticketClassService: TicketClassService,
    private readonly organizerService: OrganizerService,
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

  async findAllEvents() {
    return await super.findMany({ options: { include: this.includeInfo } });
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
}
