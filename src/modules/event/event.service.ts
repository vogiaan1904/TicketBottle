import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';

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

  async findOne(filter: Prisma.EventWhereUniqueInput) {
    return await this.databaseService.event.findUnique({
      where: filter,
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
