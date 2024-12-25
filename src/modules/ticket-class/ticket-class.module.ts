import { Module } from '@nestjs/common';
import { TicketClassService } from './ticket-class.service';
import { TicketClassController } from './ticket-class.controller';

@Module({
  controllers: [TicketClassController],
  providers: [TicketClassService],
  exports: [TicketClassService],
})
export class TicketClassModule {}
