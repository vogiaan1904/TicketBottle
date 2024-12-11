import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { UpdateEventRequestDto } from './dto/update-event.request.dto';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { EventResponseDto } from './dto/event.response.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import { GetEventQueryRequestDto } from './dto/get-eventQuery.request.dto';
import { ApiPagination } from '@/decorators/apiPagination.decorator';
import { CreateTicketClassRequestDto } from './dto/create-ticketClass.request.dto';
import { TicketClassResponseDto } from '../ticket-class/dto/ticketClass.response.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOkResponse({ type: EventResponseDto })
  @Post()
  create(@Body() createEventDto: CreateEventRequestDto) {
    return this.eventService.create(createEventDto);
  }

  @Post(':id/create-info')
  createInfo(
    @Param('id') id: string,
    @Body() createEventInfoDto: CreateEventInfoRequestDto,
  ) {
    return this.eventService.createInfo(id, createEventInfoDto);
  }

  @Post(':id/create-ticket-class')
  createTicketClass(
    @Param('id') id: string,
    @Body() createTicketClassDto: CreateTicketClassRequestDto,
  ) {
    return this.eventService.createTicketClass(id, createTicketClassDto);
  }

  @ApiOkResponse({ type: EventResponseDto, isArray: true })
  @Get()
  @ApiPagination()
  @ApiQuery({ name: 'includeInfo', required: false })
  findMany(@Query() dto: GetEventQueryRequestDto) {
    return this.eventService.findEvents(dto);
  }

  @ApiOkResponse({ type: EventResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findEventById(id);
  }

  @ApiOkResponse({ type: TicketClassResponseDto, isArray: true })
  @Get(':id/ticket-classes')
  getTicketClasses(@Param('id') id: string) {
    return this.eventService.getTicketClasses(id);
  }

  @ApiOkResponse({ type: EventResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventRequestDto,
  ) {
    return this.eventService.update({ id }, updateEventDto);
  }

  @ApiOkResponse({ type: EventResponseDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove({ id });
  }
}
