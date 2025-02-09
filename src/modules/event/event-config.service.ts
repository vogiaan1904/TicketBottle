import { InjectRedis } from '@nestjs-modules/ioredis';
import { BadRequestException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { TicketClassService } from '../ticket-class/ticket-class.service';
import { TicketClassResponseDto } from './../ticket-class/dto/ticket-class.response.dto';
import { EventResponseDto } from './dto/event.response.dto';
import { EventService } from './event.service';
import { EventStatus } from '@prisma/client';
import { EventInfoService } from '../event-info/event-info.service';

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
    private readonly eventInfoService: EventInfoService,
  ) {}

  private async isEventExist(eventID: string): Promise<EventResponseDto> {
    const event: EventResponseDto = await this.eventService.findOne({
      id: eventID,
    });
    if (!event) {
      throw new BadRequestException('Event has not been configured yet');
    }
    return event;
  }

  async requestConfigure(eventId: string): Promise<void> {
    const event: EventResponseDto = await this.isEventExist(eventId);
    const ticketClassList =
      await this.ticketClassService.findTicketClassesByEventId(eventId);

    const eventInfo = await this.eventInfoService.findOne({ eventId });

    if (!eventInfo || !eventInfo.organizerId || ticketClassList.length === 0) {
      throw new BadRequestException('Event has not been configured yet');
    }

    if (event.configStatus !== EventStatus.DRAFT) {
      throw new BadRequestException('Event has been published');
    }

    const eventDataKey = this.genRedisKey.event(eventId);

    await this.redis.hset(eventDataKey, {
      id: event.id,
      maxTicketsPerCustomer: event.maxTicketsPerCustomer,
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
      this.genRedisKey.eventConfigStatus(eventId),
      EventConfigStatus.Ok,
    );

    await this.eventService.update(
      { id: eventId },
      { configStatus: EventStatus.PUBLISHED },
    );
  }

  async checkIsReadyForSale(eventID: string): Promise<boolean> {
    await this.isEventExist(eventID);

    const configStatus = await this.redis.get(
      this.genRedisKey.eventConfigStatus(eventID),
    );

    return configStatus === EventConfigStatus.Ok;
  }

  async getSaleData(eventID: string) {
    const isReadyForSale = await this.checkIsReadyForSale(eventID);

    const eventKey = this.genRedisKey.event(eventID);

    const ticketClassList =
      await this.ticketClassService.findTicketClassesByEventId(eventID);

    const isFree = await this.redis.hget(eventKey, 'isFree');
    const maxTicketsPerCustomer = await this.redis.hget(
      eventKey,
      'maxTicketsPerCustomer',
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
      maxTicketsPerCustomer,
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
