import { Module } from '@nestjs/common';
import { TicketClassModule } from '../ticket-class/ticket-class.module';
import { EventConfigService } from './event-config.service';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  controllers: [EventController],
  imports: [TicketClassModule],
  providers: [EventService, EventConfigService],
  exports: [EventService, EventConfigService],
})
export class EventModule {}
