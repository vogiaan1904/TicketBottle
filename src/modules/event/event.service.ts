import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EventService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createEventDto: Prisma.EventCreateInput) {
    return await this.databaseService.event.create({
      data: createEventDto,
    });
  }

  async findAll() {
    return await this.databaseService.event.findMany();
  }

  async findOne(id: string) {
    return await this.databaseService.event.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateEventDto: Prisma.EventUpdateInput) {
    return await this.databaseService.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async remove(id: string) {
    return await this.databaseService.event.delete({
      where: { id },
    });
  }
}
