import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { EventConfigService } from '../event/event-config.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
  imports: [EventConfigService],
})
export class OrderModule {}
