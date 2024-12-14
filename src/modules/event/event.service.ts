import { BaseService } from '@/services/base.service';
import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { EventResponseDto } from './dto/event.response.dto';
import { UpdateStaffPasswordRequestDto } from './dto/update-staffPassword.request.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import { GetEventQueryRequestDto } from './dto/get-eventQuery.request.dto';
import { CreateTicketClassRequestDto } from '../ticket-class/dto/create-ticketClass.request.dto';
import { TicketClassService } from '../ticket-class/ticket-class.service';

@Injectable()
export class EventService extends BaseService<Event> {
  private includeInfo = { eventInfo: true };
  private includeTicketClasses = { ticketClasses: true };
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly ticketClassService: TicketClassService,
  ) {
    super(databaseService, 'event', EventResponseDto);
  }

  async createInfo(id: string, data: CreateEventInfoRequestDto) {
    return await super.update(
      { id },
      {
        eventInfo: {
          create: data,
        },
      },
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

  async findALlEvents() {
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
