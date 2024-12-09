import { ApiExtraModels } from '@nestjs/swagger';
import { CreateTicketClassDto } from '../../ticketClass/dto/create-ticketClass.dto';
import { ConnectTicketClassDto } from '../../ticketClass/dto/connect-ticketClass.dto';

export class CreateEventTicketClassesRelationInputDto {
  create?: CreateTicketClassDto[];
  connect?: ConnectTicketClassDto[];
}

@ApiExtraModels(
  CreateTicketClassDto,
  ConnectTicketClassDto,
  CreateEventTicketClassesRelationInputDto,
)
export class CreateEventDto {
  numberOfTickets: number;
  startSellDate: Date;
  endSellDate: Date;
  isFree: boolean;
  maxTicketsPerOrder: number;
  staffUsername: string;
  staffPassword: string;
  ticketClasses?: CreateEventTicketClassesRelationInputDto;
}
