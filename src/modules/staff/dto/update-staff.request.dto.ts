import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffRequestDto } from './create-staff.request.dto';

export class UpdateStaffRequestDto extends PartialType(CreateStaffRequestDto) {}
