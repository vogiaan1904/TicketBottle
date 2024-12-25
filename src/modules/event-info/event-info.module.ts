import { Module } from '@nestjs/common';
import { EventInfoController } from './event-info.controller';
import { EventInfoService } from './event-info.service';

@Module({
  controllers: [EventInfoController],
  providers: [EventInfoService],
  exports: [EventInfoService],
})
export class EventInfoModule {}
