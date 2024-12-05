import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TicketService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createTicketDto: Prisma.TicketCreateInput) {
    return await this.databaseService.ticket.create({
      data: createTicketDto,
    });
  }

  async findAll() {
    return await this.databaseService.ticket.findMany();
  }

  async findOne(filter: Prisma.TicketWhereUniqueInput) {
    return await this.databaseService.ticket.findUnique({
      where: filter,
    });
  }

  async update(id: string, updateTicketDto: Prisma.TicketUpdateInput) {
    return await this.databaseService.ticket.update({
      where: { id },
      data: updateTicketDto,
    });
  }

  async remove(id: string) {
    return await this.databaseService.ticket.delete({
      where: { id },
    });
  }
}
