import { ApiPagination } from '@/decorators/apiPagination.decorator';
import { ApiPost } from '@/decorators/apiPost.decorator';
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
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateTicketClassRequestDto } from '../ticket-class/dto/create-ticketClass.request.dto';
import { TicketClassResponseDto } from '../ticket-class/dto/ticket-class.response.dto';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import {
  EventResponseDto,
  EventStatisticsResponseDto,
} from './dto/event.response.dto';
import { GetEventQueryRequestDto } from './dto/get-eventQuery.request.dto';
import { UpdateEventRequestDto } from './dto/update-event.request.dto';
import { EventConfigService } from './event-config.service';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly eventConfigService: EventConfigService,
  ) {}

  @OnlyAdmin()
  @Post()
  @ApiCreatedResponse({ type: EventResponseDto })
  create(@Body() createEventDto: CreateEventRequestDto) {
    return this.eventService.create(createEventDto);
  }

  @OnlyAdmin()
  @Post(':id/request-configure')
  @ApiCreatedResponse({ type: EventResponseDto })
  requestConfigure(@Param('id') id: string) {
    return this.eventConfigService.requestConfigure(id);
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
  findMany(@Query() query: GetEventQueryRequestDto) {
    return this.eventService.findEvents(query);
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
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventRequestDto,
  ) {
    return this.eventService.update({ id }, updateEventDto);
  }

  @OnlyAdmin()
  @ApiOkResponse({ type: EventResponseDto })
  @Patch(':id/status')
  updateInfo(
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

  @OnlyAdmin()
  @ApiPost({ path: ':id/configure' })
  @ApiOperation({ summary: 'Prepare data for sale' })
  requestConfigureEvent(@Param('id') id: string) {
    return this.eventConfigService.requestConfigure(id);
  }

  @OnlyAdmin()
  @Get(':id/sales')
  @ApiOperation({ summary: 'Get sale data of an event' })
  getEventConfig(@Param('id') id: string) {
    return this.eventConfigService.getSaleData(id);
  }

  //Dashboard API

  @OnlyAdmin()
  @ApiOkResponse({ type: EventResponseDto, isArray: true })
  @Get('upcoming')
  @ApiPagination()
  @ApiQuery({ name: 'includeInfo', required: false })
  findUpComingEvents(@Query() dto: GetEventQueryRequestDto) {
    return this.eventService.findUpComingEvents(dto);
  }

  // for all events
  @OnlyAdmin()
  @ApiOkResponse({ type: EventResponseDto, isArray: true })
  @Get('most-sold')
  @ApiPagination()
  @ApiQuery({ name: 'includeInfo', required: false })
  findMostSoldEvents(@Query() dto: GetEventQueryRequestDto) {
    return this.eventService.findMostSoldEvents(dto);
  }

  // for each event
  @OnlyAdmin()
  @ApiOkResponse({ type: EventStatisticsResponseDto })
  @Get(':id/dashboard-statistics')
  getDashboardStatistics(@Param('id') id: string) {
    return this.eventService.getStatistics(id);
  }
}
