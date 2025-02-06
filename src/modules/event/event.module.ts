import { Module } from '@nestjs/common';
import { TicketClassModule } from '../ticket-class/ticket-class.module';
import { EventConfigService } from './event-config.service';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventInfoModule } from '../event-info/event-info.module';
import { OrganizerModule } from '../organizer/organizer.module';
import { EventRecommendService } from './event-recommend.service';

@Module({
  controllers: [EventController],
  imports: [TicketClassModule, EventInfoModule, OrganizerModule],
  providers: [EventService, EventConfigService, EventRecommendService],
  exports: [EventService, EventConfigService],
})
export class EventModule {}
