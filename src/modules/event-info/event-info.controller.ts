import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { EventInfoService } from './event-info.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { EventInfoResponseDto } from './dto/event-info.response.dto';
import { UpdateEventInfoRequestDto } from './dto/update-event-info.request.dto';
import { OnlyAdmin } from '@/decorators/require-staff-role.decorator';

@Controller('event-info')
export class EventInfoController {
  constructor(private readonly eventInfoService: EventInfoService) {}

  @ApiOkResponse({ type: EventInfoResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventInfoService.findOne({ id });
  }

  @OnlyAdmin()
  @ApiOkResponse({ type: EventInfoResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventInfoDto: UpdateEventInfoRequestDto,
  ) {
    return this.eventInfoService.update({ id }, updateEventInfoDto);
  }

  @OnlyAdmin()
  @ApiOkResponse({ type: EventInfoResponseDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventInfoService.remove({ id });
  }
}
