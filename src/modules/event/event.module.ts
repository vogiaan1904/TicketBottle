import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TicketClassModule } from '../ticket-class/ticket-class.module';
import { EventConfigService } from './event-config.service';

@Module({
  controllers: [EventController],
  imports: [TicketClassModule],
  providers: [EventService, EventConfigService],
  exports: [EventService, EventConfigService],
})
export class EventModule {}
