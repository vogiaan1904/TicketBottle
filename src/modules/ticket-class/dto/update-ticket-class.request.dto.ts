import { PartialType } from '@nestjs/swagger';
import { CreateTicketClassRequestDto } from './create-ticketClass.request.dto';

export class UpdateTicketClassRequestDto extends PartialType(
  CreateTicketClassRequestDto,
) {}
