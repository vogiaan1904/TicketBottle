import { ApiExtraModels } from '@nestjs/swagger';
import { CreateTicketDto } from '../../ticket/dto/create-ticket.dto';
import { ConnectTicketDto } from '../../ticket/dto/connect-ticket.dto';

export class UpdateTicketClassTicketsRelationInputDto {
  create?: CreateTicketDto[];
  connect?: ConnectTicketDto[];
}

@ApiExtraModels(
  CreateTicketDto,
  ConnectTicketDto,
  UpdateTicketClassTicketsRelationInputDto,
)
export class UpdateTicketClassDto {
  name?: string;
  description?: string;
  price?: number;
  tickets?: UpdateTicketClassTicketsRelationInputDto;
}
