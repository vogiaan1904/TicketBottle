import { Module } from '@nestjs/common';
import { EventInfoController } from './eventInfo.controller';
import { EventInfoService } from './eventInfo.service';

@Module({
  controllers: [EventInfoController],
  providers: [EventInfoService],
  exports: [EventInfoService],
})
export class EventInfoModule {}
