import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateTicketRequestDto {
  @IsEnum(TicketStatus)
  @ApiProperty({ enum: TicketStatus, enumName: 'TicketStatus' })
  status: TicketStatus;
}
