import { BaseService } from '@/services/base/base.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { Queue } from 'bullmq';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateTicketRequestDto } from './dto/create-ticket.request.dto';
import { TicketResponseDto } from './dto/ticket.response.dto';

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

  async updateCheckInStatus(serialNumber: string) {
    return await super.update(
      { serialNumber },
      { isCheckIn: true, checkInAt: new Date() },
    );
  }
}
