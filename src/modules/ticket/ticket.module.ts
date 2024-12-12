import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  imports: [
    BullModule.registerQueue({
      name: 'ticket',
      prefix: 'tickets',
    }),
  ],
})
export class TicketModule {}
