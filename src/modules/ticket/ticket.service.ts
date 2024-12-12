import { BaseService } from '@/services/base.service';
import { Injectable } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { TicketResponseDto } from './dto/ticket.response.dto';
import { CreateTicketRequestDto } from './dto/create-ticket.request.dto';
import { UpdateTicketRequestDto } from './dto/update-ticket.request.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TicketService extends BaseService<Ticket> {
  constructor(
    @InjectQueue('ticket')
    private readonly image_optimize_queue: Queue,
    private readonly databaseService: DatabaseService,
  ) {
    super(databaseService, 'event', TicketResponseDto);
  }

  async create(dto: CreateTicketRequestDto) {
    return await super.create({
      event: {
        connect: {
          id: dto.eventId,
        },
      },
      ticketClass: {
        connect: {
          id: dto.ticketClassId,
        },
      },
    });
  }

  async update(id: string, dto: UpdateTicketRequestDto) {
    return await super.update({ id }, dto);
  }
}
