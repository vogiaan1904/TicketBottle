import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { UpdateEventRequestDto } from './dto/update-event.request.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { EventResponseDto } from './dto/event.response.dto';
import { CreateEventInfoRequestDto } from './dto/create-eventInfo.request.dto';

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

  @ApiOkResponse({ type: EventResponseDto, isArray: true })
  @Get()
  findAll() {
    return this.eventService.findMany();
  }

  @ApiOkResponse({ type: EventResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findById(id);
  }

  @ApiOkResponse({ type: EventResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventRequestDto,
  ) {
    return this.eventService.update(id, updateEventDto);
  }

  @ApiOkResponse({ type: EventResponseDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
