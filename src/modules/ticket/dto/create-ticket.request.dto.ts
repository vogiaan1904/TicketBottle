import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTicketRequestDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @IsString()
  ticketClassId: string;
}
