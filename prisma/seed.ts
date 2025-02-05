import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { EventStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genEventList = () => {
  const rs = [
    {
      id: 'mockEvent11',
      startSellDate: new Date('2024-11-23T06:00:00Z'), // 7 days before 2024-11-30T06:00:00Z
      endSellDate: new Date('2024-11-29T06:00:00Z'), // 1 day before
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent12',
      startSellDate: new Date('2024-11-23T08:00:00Z'), // 7 days before 2024-11-30T08:00:00Z
      endSellDate: new Date('2024-11-29T08:00:00Z'),
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent13',
      startSellDate: new Date('2024-11-23T10:30:00Z'), // 7 days before 2024-11-30T10:30:00Z
      endSellDate: new Date('2024-11-29T10:30:00Z'),
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent14',
      startSellDate: new Date('2024-11-23T11:00:00Z'), // 7 days before 2024-11-30T11:00:00Z
      endSellDate: new Date('2024-11-29T11:00:00Z'),
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent15',
      startSellDate: new Date('2024-11-23T12:00:00Z'), // 7 days before 2024-11-30T12:00:00Z
      endSellDate: new Date('2024-11-29T12:00:00Z'),
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent16',
      startSellDate: new Date('2024-11-23T12:30:00Z'), // 7 days before 2024-11-30T12:30:00Z
      endSellDate: new Date('2024-11-29T12:30:00Z'),
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent17',
      startSellDate: new Date('2024-11-27T08:00:00Z'), // 7 days before 2024-12-04T08:00:00Z
      endSellDate: new Date('2024-12-03T08:00:00Z'), // 1 day before
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent18',
      startSellDate: new Date('2024-11-29T21:30:00Z'), // 7 days before 2024-12-06T21:30:00Z
      endSellDate: new Date('2024-12-05T21:30:00Z'),
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent19',
      startSellDate: new Date('2024-11-30T07:00:00Z'), // 7 days before 2024-12-07T07:00:00Z
      endSellDate: new Date('2024-12-06T07:00:00Z'),
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 5,
    },
    {
      id: 'mockEvent20',
      startSellDate: new Date('2024-11-30T12:00:00Z'), // 7 days before 2024-12-07T12:00:00Z
      endSellDate: new Date('2024-12-06T12:00:00Z'),
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
  const rs = [
    {
      name: 'YÊU HOÀ BÌNH 2024',
      description:
        'Experience an electrifying concert event that brings together top Vietnamese talents.',
      startDate: new Date('2024-11-30T06:00:00Z'),
      // Set endDate one hour later as an example
      endDate: new Date(
        new Date('2024-11-30T06:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/78/6d/d7/6fb7220d2cca0166bf90c2c78866d91b.jpg',
      eventId: 'mockEvent11',
      organizerId: 'mockOrganizer1',
    },
    {
      name: '[Đà Nẵng] Những Thành Phố Mơ Màng Year End 2024',
      description:
        'A dazzling year-end celebration in Da Nang featuring spectacular live performances.',
      startDate: new Date('2024-11-30T08:00:00Z'),
      endDate: new Date(
        new Date('2024-11-30T08:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Đà Nẵng, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/cd/5e/61/df391f3476fbdae8ae9026dba07c8ad6.png',
      eventId: 'mockEvent12',
      organizerId: 'mockOrganizer2',
    },
    {
      name: 'LULULOLA SHOW THÙY CHI & MAI TIẾN DŨNG | YÊU THƯƠNG MONG MANH',
      description:
        'A captivating live show merging dramatic storytelling with unforgettable performances.',
      startDate: new Date('2024-11-30T10:30:00Z'),
      endDate: new Date(
        new Date('2024-11-30T10:30:00Z').getTime() + 90 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/e9/fb/9b/4501e2de06f2b5f454dc35b119d24217.png',
      eventId: 'mockEvent13',
      organizerId: 'mockOrganizer3',
    },
    {
      name: 'LATA CONCERT : HOÀNG HÔN SAU CƠN MƯA - TRUNG QUÂN IDOL',
      description:
        'An energetic concert featuring stellar performances by Trung Quân Idol.',
      startDate: new Date('2024-11-30T11:00:00Z'),
      endDate: new Date(
        new Date('2024-11-30T11:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/16/f2/68/e6f18a6c44a485a6e4ba0b4b298576d1.jpg',
      eventId: 'mockEvent14',
      organizerId: 'mockOrganizer4',
    },
    {
      name: 'ConCert " MARS IN HANOI "',
      description:
        'A futuristic musical spectacle lighting up Hanoi with mesmerizing live acts.',
      startDate: new Date('2024-11-30T12:00:00Z'),
      endDate: new Date(
        new Date('2024-11-30T12:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/0a/4e/8e/8397377c70345ceb9b3a03ff0beeb19a.jpg',
      eventId: 'mockEvent15',
      organizerId: 'mockOrganizer4',
    },
    {
      name: 'Đêm Cổ Tích tại Vạn Phúc Water Show',
      description:
        'A magical outdoor performance set against the enchanting backdrop of Vạn Phúc.',
      startDate: new Date('2024-11-30T12:30:00Z'),
      endDate: new Date(
        new Date('2024-11-30T12:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/21/28/82/c9a75f04cd4d1df3727831d9b2d25a1f.jpg',
      eventId: 'mockEvent16',
      organizerId: 'mockOrganizer4',
    },
    {
      name: '2024 SOOBIN Fan Meeting In HCMC: PROMise',
      description:
        'Connect with Soobin at an exclusive fan meeting event in Ho Chi Minh City.',
      startDate: new Date('2024-12-04T08:00:00Z'),
      endDate: new Date(
        new Date('2024-12-04T08:00:00Z').getTime() + 90 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/6e/0c/af/7d24dc88c6955aa0caeca421046956ad.jpg',
      eventId: 'mockEvent17',
      organizerId: 'mockOrganizer5',
    },
    {
      name: '[Đà Lạt] 5AM CONCERT',
      description:
        'Wake up to a spectacular live concert in the cool ambiance of Đà Lạt.',
      startDate: new Date('2024-12-06T21:30:00Z'),
      endDate: new Date(
        new Date('2024-12-06T21:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Đà Lạt, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/83/97/51/0ad6e043efaeb139f0dbed818963279d.jpg',
      eventId: 'mockEvent18',
      organizerId: 'mockOrganizer5',
    },
    {
      name: 'ANH TRAI "SAY HI" HÀ NỘI - CONCERT 3',
      description:
        'A dynamic live concert event promising standout performances in Hanoi.',
      startDate: new Date('2024-12-07T07:00:00Z'),
      endDate: new Date(
        new Date('2024-12-07T07:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/5e/e6/d8/7d1184dadc49eeb85c72e3b469cb9f33.jpg',
      eventId: 'mockEvent19',
      organizerId: 'mockOrganizer6',
    },
    {
      name: 'ĐÊM TRĂNG TRÊN ĐỈNH VÂN SƠN',
      description:
        'An unforgettable evening performance set atop the scenic Đỉnh Vân Sơn.',
      startDate: new Date('2024-12-07T12:00:00Z'),
      endDate: new Date(
        new Date('2024-12-07T12:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/a6/6d/40/709fac7f03cb28af066df0c0848103b9.jpg',
      eventId: 'mockEvent20',
      organizerId: 'mockOrganizer6',
    },
  ];
  return rs;
};

const genTicketClassList = () => {
  const rs = [
    {
      id: 'testTicketClass1Event2',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 200000,
      totalQuantity: 1000,
      eventId: 'mockEvent11',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 399000,
      totalQuantity: 1200,
      eventId: 'mockEvent12',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 499000,
      totalQuantity: 800,
      eventId: 'mockEvent13',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Standard',
      description: 'Standard entry ticket.',
      price: 259000,
      totalQuantity: 700,
      eventId: 'mockEvent14',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Early Access',
      description: 'Early access to the event venue.',
      price: 219000,
      totalQuantity: 500,
      eventId: 'mockEvent15',
    },
    {
      id: 'testTicketClass2Event15',
      name: 'Regular Ticket',
      description: 'Regular entry to the event.',
      price: 149000,
      totalQuantity: 700,
      eventId: 'mockEvent15',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Backstage Pass',
      description: 'Access to backstage areas and meet the organizers.',
      price: 599000,
      totalQuantity: 600,
      eventId: 'mockEvent16',
    },
    {
      id: 'testTicketClass2Event16',
      name: 'Standard Entry',
      description: 'Standard entry ticket with access to all general areas.',
      price: 325000,
      totalQuantity: 700,
      eventId: 'mockEvent16',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Express Entry',
      description: 'Express entry to skip the queues.',
      price: 199000,
      totalQuantity: 600,
      eventId: 'mockEvent17',
    },
    {
      id: 'testTicketClass2Event17',
      name: 'Standard Ticket',
      description: 'Regular entry to the event.',
      price: 99000,
      totalQuantity: 220,
      eventId: 'mockEvent17',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Exclusive Access',
      description: 'Exclusive access to VIP lounges and premium facilities.',
      price: 400000,
      totalQuantity: 200,
      eventId: 'mockEvent18',
    },
    {
      id: 'testTicketClass2Event18',
      name: 'General Admission',
      description:
        'General admission ticket with access to all standard areas.',
      price: 500000,
      totalQuantity: 250,
      eventId: 'mockEvent18',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Fan Zone',
      description:
        'General admission ticket with access to all standard areas.',
      price: 2500000,
      totalQuantity: 250,
      eventId: 'mockEvent19',
    },
    {
      id: 'testTicketClass2Event19',
      name: 'Vip',
      description:
        'General admission ticket with access to all standard areas.',
      price: 10000000,
      totalQuantity: 100,
      eventId: 'mockEvent19',
    },
    {
      id: 'testTicketClass1Event20',
      name: 'General Admission',
      description:
        'General admission ticket with access to all standard areas.',
      price: 200000,
      totalQuantity: 250,
      eventId: 'mockEvent20',
    },
    {
      id: 'testTicketClass2Event20',
      name: 'Premium',
      description: 'Premium admission ticket',
      price: 500000,
      totalQuantity: 250,
      eventId: 'mockEvent20',
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
