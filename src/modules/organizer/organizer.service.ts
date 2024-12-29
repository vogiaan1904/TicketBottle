import { BaseService } from '@/services/base/base.service';
import { Injectable } from '@nestjs/common';
import { Organizer } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { OrganizerResponseDto } from './dto/organizer.response.dto';

@Injectable()
export class OrganizerService extends BaseService<Organizer> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'organizer', OrganizerResponseDto);
  }

  async getEventsByOrganizerId(id: string) {
    return await this.findOne(
      { id },
      {
        select: {
          events: true,
        },
      },
    );
  }
}
