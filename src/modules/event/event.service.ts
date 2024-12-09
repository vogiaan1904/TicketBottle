import { BaseService } from '@/services/base.service';
import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { faker } from '@faker-js/faker';
import { EventResponseDto } from './dto/event.response.dto';
import { UpdateStaffPasswordRequestDto } from './dto/update-staffPassword.request.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';

@Injectable()
export class EventService extends BaseService<Event> {
  private includeInfo = { eventInfo: true };
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'event', EventResponseDto);
  }

  async create(data: CreateEventRequestDto) {
    const staffUsername = faker.internet.username();
    const staffPassword = faker.string.alphanumeric(8);
    return await super.create({ ...data, staffUsername, staffPassword });
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

  async findMany() {
    return await super.findMany({ include: this.includeInfo });
  }

  async findById(id: string) {
    return await super.findOne({ id }, { include: this.includeInfo });
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
