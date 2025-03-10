import { BaseService } from '@/services/base/base.service';
import { Injectable } from '@nestjs/common';
import { TicketClass } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { TicketClassResponseDto } from './dto/ticket-class.response.dto';

@Injectable()
export class TicketClassService extends BaseService<TicketClass> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'ticketClass', TicketClassResponseDto);
  }

  async findTicketClassesByEventId(eventId: string) {
    return await super.findMany({ filter: { eventId } });
  }
}
