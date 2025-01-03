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
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { TicketClassResponseDto } from '../ticket-class/dto/ticket-class.response.dto';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';
import { CreateTicketClassRequestDto } from '../ticket-class/dto/create-ticketClass.request.dto';
import { EventResponseDto } from './dto/event.response.dto';
import { GetEventQueryRequestDto } from './dto/get-eventQuery.request.dto';
import { UpdateEventRequestDto } from './dto/update-event.request.dto';
import { EventService } from './event.service';
import { EventConfigService } from './event-config.service';
import { ApiPost } from '@/decorators/apiPost.decorator';

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
}
