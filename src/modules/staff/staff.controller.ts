import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { CreateStaffRequestDto } from './dto/create-staff.request.dto';
import { StaffResponseDto } from './dto/staff.response.dto';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}
  @ApiCreatedResponse({ type: StaffResponseDto })
  @Post()
  create(@Body() createStaffDto: CreateStaffRequestDto) {
    return this.staffService.create(createStaffDto);
  }
}
