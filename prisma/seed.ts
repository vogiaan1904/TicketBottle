import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { EventStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genEventList = () => {
  const now = new Date();
  const endDay = new Date();
  endDay.setMonth(endDay.getMonth() + 1);
  const rs = [
    {
      id: 'mockEvent1',
      startSellDate: now,
      endSellDate: endDay,
      isFree: true,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 1,
    },
    {
      id: 'mockEvent2',
      startSellDate: now,
      endSellDate: endDay,
      isFree: true,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 1,
    },
    {
      id: 'mockEvent3',
      startSellDate: now,
      endSellDate: endDay,
      isFree: true,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 1,
    },
    {
      id: 'mockEvent4',
      startSellDate: now,
      endSellDate: endDay,
      isFree: true,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 1,
    },
    {
      id: 'mockEvent5',
      startSellDate: now,
      endSellDate: endDay,
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 10,
    },
    {
      id: 'mockEvent6',
      startSellDate: now,
      endSellDate: endDay,
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent7',
      startSellDate: now,
      endSellDate: endDay,
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 7,
    },
    {
      id: 'mockEvent8',
      startSellDate: now,
      endSellDate: endDay,
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
  ];
  return rs;
};

const genOrganizerList = () => {
  const rs = [
    {
      id: 'mockOrganizer1',
      name: 'Mock Organizer 1',
      description: 'Mock description',
      email: 'mockOrg1@example.com',
      thumbnail: '',
    },
    {
      id: 'mockOrganizer2',
      name: 'Mock Organizer 2',
      description: 'Mock description',
      email: 'mockOrg2@example.com',
      thumbnail: '',
    },
    {
      id: 'mockOrganizer3',
      name: 'Mock Organizer 3',
      description: 'Mock description',
      email: 'mockOrg3@example.com',
      thumbnail: '',
    },
    {
      id: 'mockOrganizer4',
      name: 'Mock Organizer 4',
      description: 'Mock description',
      email: 'mockOrg4@example.com',
      thumbnail: '',
    },
    {
      id: 'mockOrganizer5',
      name: 'Mock Organizer 5',
      description: 'Mock description',
      email: 'mockOrg5@example.com',
      thumbnail: '',
    },
    {
      id: 'mockOrganizer6',
      name: 'Mock Organizer 6',
      description: 'Mock description',
      email: 'mockOrg6@example.com',
      thumbnail: '',
    },
  ];
  return rs;
};

const genEventInfoList = () => {
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  const rs = [
    {
      name: 'Hanoi International Film Festival',
      description:
        'An annual festival celebrating international and Vietnamese cinema.',
      startDate: now,
      endDate: endDate,
      location: 'Hanoi, Vietnam',
      thumbnail: 'https://example.com/thumbnails/hanoi_film_festival.jpg',
      eventId: 'mockEvent1',
      organizerId: 'mockOrganizer1',
    },
    {
      name: 'Ho Chi Minh City Food Festival',
      description:
        'A vibrant festival showcasing the best of Vietnamese cuisine.',
      startDate: now,
      endDate: endDate,
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail: 'https://example.com/thumbnails/hcmc_food_festival.jpg',
      eventId: 'mockEvent2',
      organizerId: 'mockOrganizer2',
    },
    {
      name: 'Da Nang Beach Music Concert',
      description:
        'Live music performances by local and international artists on the beaches of Da Nang.',
      startDate: now,
      endDate: endDate,
      location: 'Da Nang, Vietnam',
      thumbnail: 'https://example.com/thumbnails/danang_beach_concert.jpg',
      eventId: 'mockEvent3',
      organizerId: 'mockOrganizer3',
    },
    {
      name: 'Hue Historical Exhibition',
      description:
        'An exhibition exploring the rich history and culture of Hue.',
      startDate: now,
      endDate: endDate,
      location: 'Hue, Vietnam',
      thumbnail: 'https://example.com/thumbnails/hue_historical_exhibition.jpg',
      eventId: 'mockEvent4',
      organizerId: 'mockOrganizer4',
    },
    {
      name: 'Nha Trang Sailing Regatta',
      description:
        'A competitive sailing event attracting enthusiasts from around the region.',
      startDate: now,
      endDate: endDate,
      location: 'Nha Trang, Vietnam',
      thumbnail: 'https://example.com/thumbnails/nhatrang_sailing_regatta.jpg',
      eventId: 'mockEvent5',
      organizerId: 'mockOrganizer5',
    },
    {
      name: 'Ha Long Bay Eco Tour',
      description:
        'A guided eco-tour exploring the natural wonders of Ha Long Bay.',
      startDate: now,
      endDate: endDate,
      location: 'Ha Long Bay, Vietnam',
      thumbnail: 'https://example.com/thumbnails/halong_bay_eco_tour.jpg',
      eventId: 'mockEvent6',
      organizerId: 'mockOrganizer5',
    },
    {
      name: 'Sapa Cultural Fair',
      description:
        'A fair celebrating the diverse cultures of the hill tribes in Sapa.',
      startDate: now,
      endDate: endDate,
      location: 'Sapa, Vietnam',
      thumbnail: 'https://example.com/thumbnails/sapa_cultural_fair.jpg',
      eventId: 'mockEvent7',
      organizerId: 'mockOrganizer6',
    },
    {
      name: 'Can Tho River Cruise Gala',
      description:
        'An elegant river cruise event featuring live music and fine dining in Can Tho.',
      startDate: now,
      endDate: endDate,
      location: 'Can Tho, Vietnam',
      thumbnail: 'https://example.com/thumbnails/cantho_river_cruise_gala.jpg',
      eventId: 'mockEvent8',
      organizerId: 'mockOrganizer6',
    },
  ];
  return rs;
};

const genTicketClassList = () => {
  const rs = [
    {
      id: 'testTicketClass1Event1',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 0,
      totalQuantity: 100,
      eventId: 'mockEvent1',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 0,
      totalQuantity: 50,
      eventId: 'mockEvent2',
    },
    {
      id: 'testTicketClass1Event3',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 0,
      totalQuantity: 30,
      eventId: 'mockEvent3',
    },
    {
      id: 'testTicketClass1Event4',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 0,
      totalQuantity: 180,
      eventId: 'mockEvent4',
    },
    {
      id: 'testTicketClass1Event5',
      name: 'Early Access',
      description: 'Early access to the event venue.',
      price: 70,
      totalQuantity: 100,
      eventId: 'mockEvent5',
    },
    {
      id: 'testTicketClass2Event5',
      name: 'Regular Ticket',
      description: 'Regular entry to the event.',
      price: 85,
      totalQuantity: 200,
      eventId: 'mockEvent5',
    },
    {
      id: 'testTicketClass1Event6',
      name: 'Backstage Pass',
      description: 'Access to backstage areas and meet the organizers.',
      price: 200,
      totalQuantity: 20,
      eventId: 'mockEvent6',
    },
    {
      id: 'testTicketClass2Event6',
      name: 'Standard Entry',
      description: 'Standard entry ticket with access to all general areas.',
      price: 100,
      totalQuantity: 150,
      eventId: 'mockEvent6',
    },
    {
      id: 'testTicketClass1Event7',
      name: 'Express Entry',
      description: 'Express entry to skip the queues.',
      price: 95,
      totalQuantity: 80,
      eventId: 'mockEvent7',
    },
    {
      id: 'testTicketClass2Event7',
      name: 'Standard Ticket',
      description: 'Regular entry to the event.',
      price: 65,
      totalQuantity: 220,
      eventId: 'mockEvent7',
    },
    {
      id: 'testTicketClass1Event8',
      name: 'Exclusive Access',
      description: 'Exclusive access to VIP lounges and premium facilities.',
      price: 180,
      totalQuantity: 40,
      eventId: 'mockEvent8',
    },
    {
      id: 'testTicketClass2Event8',
      name: 'General Admission',
      description:
        'General admission ticket with access to all standard areas.',
      price: 80,
      totalQuantity: 250,
      eventId: 'mockEvent8',
    },
  ];
  return rs;
};

async function main() {
  console.log('Seeding data...');

  // Create Organizers
  const organizers = genOrganizerList();
  for (const organizer of organizers) {
    await prisma.organizer.upsert({
      where: { id: organizer.id },
      update: {},
      create: organizer,
    });
  }

  // Create Events
  const events = genEventList();
  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }

  // Create Event Infos
  const eventInfos = genEventInfoList();
  for (const eventInfo of eventInfos) {
    await prisma.eventInfo.upsert({
      where: { eventId: eventInfo.eventId },
      update: {},
      create: eventInfo,
    });
  }

  // Create Ticket Classes
  const ticketClasses = genTicketClassList();
  for (const ticketClass of ticketClasses) {
    await prisma.ticketClass.upsert({
      where: { id: ticketClass.id },
      update: {},
      create: ticketClass,
    });
  }

  console.log('Seeding completed');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
