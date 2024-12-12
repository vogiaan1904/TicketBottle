import { ApiPagination } from '@/decorators/apiPagination.decorator';
import { OnlyAdmin } from '@/decorators/require-staff-role.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { TicketClassResponseDto } from '../ticket-class/dto/ticket-class.response.dto';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import { CreateTicketClassRequestDto } from './dto/create-ticketClass.request.dto';
import { EventResponseDto } from './dto/event.response.dto';
import { GetEventQueryRequestDto } from './dto/get-eventQuery.request.dto';
import { UpdateEventRequestDto } from './dto/update-event.request.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @OnlyAdmin()
  @Post()
  @ApiCreatedResponse({ type: EventResponseDto })
  create(@Body() createEventDto: CreateEventRequestDto) {
    return this.eventService.create(createEventDto);
  }

  @OnlyAdmin()
  @Post(':id/create-info')
  @ApiCreatedResponse({ type: EventResponseDto })
  createInfo(
    @Param('id') id: string,
    @Body() createEventInfoDto: CreateEventInfoRequestDto,
  ) {
    return this.eventService.createInfo(id, createEventInfoDto);
  }

  @OnlyAdmin()
  @Post(':id/create-ticket-class')
  @ApiCreatedResponse({ type: TicketClassResponseDto })
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

  @OnlyAdmin()
  @ApiOkResponse({ type: EventResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventRequestDto,
  ) {
    return this.eventService.update({ id }, updateEventDto);
  }

  @OnlyAdmin()
  @ApiOkResponse({ type: EventResponseDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove({ id });
  }
}
