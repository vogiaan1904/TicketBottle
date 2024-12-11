import { Module } from '@nestjs/common';
import { TicketClassService } from './ticketClass.service';
import { TicketClassController } from './ticketClass.controller';

@Module({
  controllers: [TicketClassController],
  providers: [TicketClassService],
  exports: [TicketClassService],
})
export class TicketClassModule {}
