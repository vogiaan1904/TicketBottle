import { InjectRedis } from '@nestjs-modules/ioredis';
import { BadRequestException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { TicketClassService } from '../ticket-class/ticket-class.service';
import { TicketClassResponseDto } from './../ticket-class/dto/ticket-class.response.dto';
import { EventResponseDto } from './dto/event.response.dto';
import { EventService } from './event.service';

enum EventConfigStatus {
  Ok = '1',
}

@Injectable()
export class EventConfigService {
  readonly genRedisKey = {
    event: (eventID: string) => `event:${eventID}`,
    eventConfigStatus: (eventID: string) => `event:${eventID}/status`,
    ticketClassData: (ticketClassID: string) => `ticketClass:${ticketClassID}`,
  };

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly eventService: EventService,
    private readonly ticketClassService: TicketClassService,
  ) {}

  private async isEventExist(eventID: string): Promise<EventResponseDto> {
    const event: EventResponseDto = await this.eventService.findOne({
      id: eventID,
    });
    if (!event) {
      throw new BadRequestException('Event has not configured yet');
    }

    return event;
  }

  async requestConfigure(eventID: string): Promise<void> {
    const event: EventResponseDto = await this.isEventExist(eventID);
    const ticketClassList =
      await this.ticketClassService.findTicketClassesByEventId(eventID);

    const eventDataKey = this.genRedisKey.event(eventID);
    await this.redis.hset(eventDataKey, {
      id: event.id,
      maxTicketsPerOrder: event.maxTicketsPerOrder,
      isFree: event.isFree,
    });

    const ticketClassDataPromise = ticketClassList.map(
      async (c: TicketClassResponseDto) => {
        const key = this.genRedisKey.ticketClassData(c.id);
        return await this.redis.hset(key, {
          id: c.id,
          name: c.name,
          total: c.totalQuantity,
          price: c.price,
          available: c.totalQuantity,
          hold: 0,
          sold: 0,
        });
      },
    );

    await Promise.all(ticketClassDataPromise);

    await this.redis.set(
      this.genRedisKey.eventConfigStatus(eventID),
      EventConfigStatus.Ok,
    );
  }

  async checkIsReadyForSale(eventID: string): Promise<boolean> {
    await this.isEventExist(eventID);

    const status = await this.redis.get(
      this.genRedisKey.eventConfigStatus(eventID),
    );

    return status === EventConfigStatus.Ok;
  }

  async getSaleData(eventID: string) {
    const isReadyForSale = await this.checkIsReadyForSale(eventID);

    const ticketClassList =
      await this.ticketClassService.findTicketClassesByEventId(eventID);

    const isFree = await this.redis.hget(
      this.genRedisKey.event(eventID),
      'isFree',
    );

    const ticketClassesInfo = await Promise.all(
      ticketClassList.map(async (c) => {
        return await this.redis.hgetall(this.genRedisKey.ticketClassData(c.id));
      }),
    );

    return {
      isReadyForSale,
      ticketClassesInfo,
      isFree,
    };
  }

  async deleteEventConfig(eventID: string): Promise<void> {
    await this.isEventExist(eventID);

    await this.redis.del(this.genRedisKey.event(eventID));
    await this.redis.del(this.genRedisKey.eventConfigStatus(eventID));

    const ticketClassList =
      await this.ticketClassService.findTicketClassesByEventId(eventID);

    const ticketClassDataPromise = ticketClassList.map(async (c) => {
      return await this.redis.del(this.genRedisKey.ticketClassData(c.id));
    });

    await Promise.all(ticketClassDataPromise);
  }
}
