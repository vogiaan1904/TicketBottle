import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { EventInfoService } from './eventInfo.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { EventInfoResponseDto } from './dto/eventInfo.response.dto';
import { UpdateEventInfoRequestDto } from './dto/update-eventInfo.request.dto';

@Controller('event-info')
export class EventInfoController {
  constructor(private readonly eventInfoService: EventInfoService) {}

  @ApiOkResponse({ type: EventInfoResponseDto, isArray: true })
  @Get()
  findAll() {
    return this.eventInfoService.findMany();
  }

  @ApiOkResponse({ type: EventInfoResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventInfoService.findOne(id);
  }

  @ApiOkResponse({ type: EventInfoResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventInfoDto: UpdateEventInfoRequestDto,
  ) {
    return this.eventInfoService.update(id, updateEventInfoDto);
  }

  @ApiOkResponse({ type: EventInfoResponseDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventInfoService.remove(id);
  }
}
