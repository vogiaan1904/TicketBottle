import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TicketClassModule } from '../ticket-class/ticketClass.module';

@Module({
  controllers: [EventController],
  imports: [TicketClassModule],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
