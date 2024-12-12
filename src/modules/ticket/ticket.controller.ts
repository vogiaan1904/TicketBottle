import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketResponseDto } from './dto/ticket.response.dto';
import { CreateTicketRequestDto } from './dto/create-ticket.request.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { OnlyAdmin } from '@/decorators/require-staff-role.decorator';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @OnlyAdmin()
  @Post()
  @ApiCreatedResponse({ type: TicketResponseDto })
  create(@Body() createTicketDto: CreateTicketRequestDto) {
    return this.ticketService.create(createTicketDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: TicketResponseDto })
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne({ id });
  }
}
