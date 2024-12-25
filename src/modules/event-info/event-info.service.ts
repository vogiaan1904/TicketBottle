import { BaseService } from '@/services/base/base.service';
import { Injectable } from '@nestjs/common';
import { EventInfo } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { EventInfoResponseDto } from './dto/event-info.response.dto';

@Injectable()
export class EventInfoService extends BaseService<EventInfo> {
  constructor(private readonly databaseService: DatabaseService) {
    super(databaseService, 'eventInfo', EventInfoResponseDto);
  }
}
