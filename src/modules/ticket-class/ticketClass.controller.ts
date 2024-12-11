import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketClassService } from './ticketClass.service';
import { UpdateTicketClassRequestDto } from './dto/update-ticketClass.request.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { TicketClassResponseDto } from './dto/ticketClass.response.dto';

@Controller('ticket-class')
export class TicketClassController {
  constructor(private readonly ticketClassService: TicketClassService) {}

  @ApiOkResponse({ type: TicketClassResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketClassService.findOne({ id });
  }

  @ApiOkResponse({ type: TicketClassResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketClassDto: UpdateTicketClassRequestDto,
  ) {
    return this.ticketClassService.update({ id }, updateTicketClassDto);
  }

  @ApiOkResponse({ type: TicketClassResponseDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketClassService.remove({ id });
  }
}
