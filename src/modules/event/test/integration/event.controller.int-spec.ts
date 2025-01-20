import { AppModule } from '@/app.module';
import { DatabaseService } from '@/modules/database/database.service';
import { OrganizerService } from '@/modules/organizer/organizer.service';
import { CreateTicketClassRequestDto } from '@/modules/ticket-class/dto/create-ticketClass.request.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { CreateEventRequestDto } from '../../dto/create-event.request.dto';
import { CreateEventInfoRequestDto } from '../../dto/create-eventInfo.request.dto';
import { EventController } from '../../event.controller';
import { EventService } from '../../event.service';

describe('EventController', () => {
  let eventController: EventController;
  let eventService: EventService;
  let organizerService: OrganizerService;
  let databaseService: DatabaseService;
  let cacheService: Cache;

  let organizerId: string;
  let eventId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
    eventService = moduleRef.get<EventService>(EventService);
    organizerService = moduleRef.get<OrganizerService>(OrganizerService);
    eventController = moduleRef.get<EventController>(EventController);
    cacheService = moduleRef.get<Cache>(CACHE_MANAGER);
    // await databaseService.cleanDatabase();
    await cacheService.reset();

    const createOrganizerDto = {
      name: 'Test organizer',
      description: 'Test description',
    };

    const createEventDto: CreateEventRequestDto = {
      startSellDate: new Date(),
      endSellDate: new Date(),
      isFree: true,
      maxTicketsPerCustomer: 100,
    };

    const organizer = await organizerService.create(createOrganizerDto);
    organizerId = organizer.id;
    expect(organizer).toBeDefined();
    expect(organizer.id).toBeDefined();
    expect(organizer.name).toBe(createOrganizerDto.name);
    expect(organizer.description).toBe(createOrganizerDto.description);

    const event = await eventController.create(createEventDto);
    eventId = event.id;
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.startSellDate).toStrictEqual(createEventDto.startSellDate);
    expect(event.endSellDate).toStrictEqual(createEventDto.endSellDate);
    expect(event.isFree).toBe(createEventDto.isFree);
    expect(event.maxTicketsPerCustomer).toBe(
      createEventDto.maxTicketsPerCustomer,
    );
  });

  afterAll(async () => {
    // Optional: Clean up or disconnect if necessary
    // await databaseService.onModuleDestroy();
    await cacheService.reset();
  });

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     controllers: [EventController],
  //     providers: [EventService],
  //   }).compile();

  //   eventController = module.get<EventController>(EventController);
  // });

  it('should be defined', () => {
    expect(eventController).toBeDefined();
  });

  describe('createEventInfor', () => {
    it('should create an event info', async () => {
      const createEventInfoDto: CreateEventInfoRequestDto = {
        name: 'Test event',
        description: 'Test description',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test location',
        thumbnail: 'Test thumbnail',
        organizerId: organizerId,
      };
      const event = await eventController.createInfo(
        eventId,
        createEventInfoDto,
      );
      const eventInfo = event.eventInfo;
      expect(eventInfo).toBeDefined();
      expect(eventInfo.name).toBe(createEventInfoDto.name);
      expect(eventInfo.description).toBe(createEventInfoDto.description);
      expect(eventInfo.startDate).toStrictEqual(createEventInfoDto.startDate);
      expect(eventInfo.endDate).toStrictEqual(createEventInfoDto.endDate);
      expect(eventInfo.location).toBe(createEventInfoDto.location);
      expect(eventInfo.thumbnail).toBe(createEventInfoDto.thumbnail);
      expect(eventInfo.organizerId).toBe(createEventInfoDto.organizerId);
    });

    it('should throw an error if the event does not exist', async () => {
      const createEventInfoDto: CreateEventInfoRequestDto = {
        name: 'Test event',
        description: 'Test description',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test location',
        thumbnail: 'Test thumbnail',
        organizerId: organizerId,
      };
      await expect(
        eventController.createInfo('invalid-event-id', createEventInfoDto),
      ).rejects.toThrow(new BadRequestException('Failed to create event info'));
    });

    it('should throw an error if the organizerId is invalid', async () => {
      const createEventInfoDto: CreateEventInfoRequestDto = {
        name: 'Test event',
        description: 'Test description',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test location',
        thumbnail: 'Test thumbnail',
        organizerId: 'invalidOrganizerId',
      };
      await expect(
        eventController.createInfo(eventId, createEventInfoDto),
      ).rejects.toThrow(new BadRequestException('Failed to create event info'));
    });

    it('should throw an error if there is existing event info', async () => {
      const createEventInfoDto: CreateEventInfoRequestDto = {
        name: 'Test event',
        description: 'Test description',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test location',
        thumbnail: 'Test thumbnail',
        organizerId: organizerId,
      };
      await expect(
        eventController.createInfo(eventId, createEventInfoDto),
      ).rejects.toThrow(new BadRequestException('Failed to create event info'));
    });
  });

  describe('createTicketClass', () => {
    const validTicketClasses: CreateTicketClassRequestDto[] = [
      {
        name: 'Test ticket class 1',
        description: 'Test description',
        price: 100,
        totalQuantity: 100,
      },

      {
        name: 'Test ticket class 2',
        description: 'Test description',
        price: 200,
        totalQuantity: 200,
      },
    ];
    it('should create ticket classes', async () => {
      const creationPromises = validTicketClasses.map(
        async (ticketClassDto) => {
          const event = await eventController.createTicketClass(
            eventId,
            ticketClassDto,
          );
          const createdTicketClass =
            event.ticketClasses[event.ticketClasses.length - 1];

          expect(createdTicketClass).toBeDefined();
          expect(createdTicketClass.name).toBe(ticketClassDto.name);
          expect(createdTicketClass.description).toBe(
            ticketClassDto.description,
          );
          expect(createdTicketClass.price).toBe(ticketClassDto.price);
          expect(createdTicketClass.totalQuantity).toBe(
            ticketClassDto.totalQuantity,
          );
        },
      );

      await Promise.all(creationPromises);
    });

    it('should throw an error if the event does not exist', async () => {
      const ticketClassDto = validTicketClasses[0];
      await expect(
        eventController.createTicketClass('invalid-event-id', ticketClassDto),
      ).rejects.toThrow(
        new BadRequestException('Failed to create ticket class'),
      );
    });
  });

  describe('requestConfigure', () => {
    let eventId: string;
    beforeAll(async () => {
      const createEventDto: CreateEventRequestDto = {
        startSellDate: new Date(),
        endSellDate: new Date(),
        isFree: true,
        maxTicketsPerCustomer: 100,
      };

      const event = await eventController.create(createEventDto);
      eventId = event.id;
    });

    it('should throw an error if there is no event info', async () => {
      await expect(eventController.requestConfigure(eventId)).rejects.toThrow(
        new BadRequestException('Event has not been configured yet'),
      );
    });

    it('should throw an error if there is no ticket class', async () => {
      const createEventInfoDto: CreateEventInfoRequestDto = {
        name: 'Test event',
        description: 'Test description',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test location',
        thumbnail: 'Test thumbnail',
        organizerId: organizerId,
      };
      await eventController.createInfo(eventId, createEventInfoDto);

      await expect(eventController.requestConfigure(eventId)).rejects.toThrow(
        new BadRequestException('Event has not been configured yet'),
      );
    });

    it('should configure the event', async () => {
      const validTicketClasses: CreateTicketClassRequestDto[] = [
        {
          name: 'Test ticket class 1',
          description: 'Test description',
          price: 100,
          totalQuantity: 100,
        },

        {
          name: 'Test ticket class 2',
          description: 'Test description',
          price: 200,
          totalQuantity: 200,
        },
      ];
      const creationPromises = validTicketClasses.map(
        async (ticketClassDto) => {
          await eventController.createTicketClass(eventId, ticketClassDto);
        },
      );
      await Promise.all(creationPromises);
      await eventController.requestConfigure(eventId);

      const event = await eventService.findOne({ id: eventId });
      // const eventKey = genRedisKey.event(eventId);

      expect(event.status).toBe('PUBLISHED');

      const eventSalesData = await eventController.getEventConfig(eventId);
      expect(eventSalesData).toBeDefined();
      expect(eventSalesData.isReadyForSale).toBe(true);
      expect(eventSalesData.isFree).toBe(event.isFree.toString());
      expect(eventSalesData.maxTicketsPerCustomer).toBe(
        event.maxTicketsPerCustomer.toString(),
      );
      for (const ticketClassInfo of eventSalesData.ticketClassesInfo) {
        expect(ticketClassInfo.available).toBe(
          ticketClassInfo.total.toString(),
        );
        expect(ticketClassInfo.hold).toBe('0');
        expect(ticketClassInfo.sold).toBe('0');
      }
    });
  });
  describe('updateEvent', () => {});
  describe('updateEventInfo', () => {});
  describe('findUpcomingEvents', () => {});
  describe('findMostSoldEvents', () => {});
  describe('getDashboardStatistics', () => {});
  describe('deleteEvent', () => {});
});
