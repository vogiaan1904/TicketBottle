import { BaseService } from '@/services/base.service';
import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { faker } from '@faker-js/faker';
import { EventResponseDto } from './dto/event.response.dto';
import { UpdateStaffPasswordRequestDto } from './dto/update-staffPassword.request.dto';

@Injectable()
export class EventService extends BaseService<Event> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'event');
  }

  async create(data: CreateEventRequestDto) {
    const staffUsername = faker.internet.username();
    const staffPassword = faker.string.alphanumeric(8);

    return new EventResponseDto(
      await super.create({ ...data, staffUsername, staffPassword }),
    );
  }

  async updateStaffPassword(
    id: string,
    newPassword: UpdateStaffPasswordRequestDto,
  ) {
    return new EventResponseDto(
      await super.update(id, { staffPassword: newPassword.newPassword }),
    );
  }
}
