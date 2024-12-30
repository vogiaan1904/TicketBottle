import { OnlyAdmin } from '@/decorators/require-staff-role.decorator';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateOrganizerRequestDto } from './dto/create-organizer.request.dto';
import { OrganizerResponseDto } from './dto/organizer.response.dto';
import { OrganizerService } from './organizer.service';
import { ApiPagination } from '@/decorators/apiPagination.decorator';
import { GetOrganizerQueryRequestDto } from './dto/get-organizer-query.request.dto';

@Controller('organizer')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @OnlyAdmin()
  @Post()
  @ApiCreatedResponse({ type: OrganizerResponseDto })
  create(@Body() createOrganizerDto: CreateOrganizerRequestDto) {
    return this.organizerService.create(createOrganizerDto);
  }

  @OnlyAdmin()
  @Get()
  @ApiPagination()
  @ApiOkResponse({ type: OrganizerResponseDto, isArray: true })
  findMany(@Query() dto: GetOrganizerQueryRequestDto) {
    return this.organizerService.findManyWithPagination(dto);
  }

  @OnlyAdmin()
  @Get(':id/events')
  @ApiPagination()
  @ApiOkResponse({ type: OrganizerResponseDto })
  getEvents(@Param('id') id: string) {
    return this.organizerService.getEventsByOrganizerId(id);
  }
}
