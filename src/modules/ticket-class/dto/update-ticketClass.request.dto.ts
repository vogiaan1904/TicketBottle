import { PartialType } from '@nestjs/swagger';
import { CreateTicketClassRequestDto } from '../../event/dto/create-ticketClass.request.dto';

export class UpdateTicketClassRequestDto extends PartialType(
  CreateTicketClassRequestDto,
) {}
