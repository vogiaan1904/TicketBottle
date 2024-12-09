import { PartialType } from '@nestjs/swagger';
import { CreateEventRequestDto } from './create-event.request.dto';

export class UpdateEventRequestDto extends PartialType(CreateEventRequestDto) {}
