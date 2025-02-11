import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketResponseDto } from './dto/ticket.response.dto';
import { CreateTicketRequestDto } from './dto/create-ticket.request.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { OnlyAdmin } from '@/decorators/require-staff-role.decorator';
// Chưa thêm authen và author
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

  @OnlyAdmin()
  @Get(':serial-number/check-in')
  @ApiOkResponse()
  updateCheckInStatus(@Param('serial-number') serialNumber: string) {
    this.ticketService.updateCheckInStatus(serialNumber);
  }
}
