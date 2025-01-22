import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEventInfoRequestDto } from '../../event/dto/create-eventInfo.request.dto';

export class UpdateEventInfoRequestDto extends PartialType(
  OmitType(CreateEventInfoRequestDto, ['organizerId'] as const),
) {}
