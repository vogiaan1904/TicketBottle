import { ApiExtraModels } from '@nestjs/swagger';
import { CreateTicketDto } from '../../ticket/dto/create-ticket.dto';
import { ConnectTicketDto } from '../../ticket/dto/connect-ticket.dto';

export class CreateTicketClassTicketsRelationInputDto {
  create?: CreateTicketDto[];
  connect?: ConnectTicketDto[];
}

@ApiExtraModels(
  CreateTicketDto,
  ConnectTicketDto,
  CreateTicketClassTicketsRelationInputDto,
)
export class CreateTicketClassDto {
  name: string;
  description: string;
  price: number;
  tickets?: CreateTicketClassTicketsRelationInputDto;
}
