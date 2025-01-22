import { EventStatus, Gender, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const defaultPassword = '123';

const genUserList = (count: number = 2) => {
  const users = [];
  const hashedPassword = bcrypt.hashSync(defaultPassword, 8);
  for (let i = 0; i < count; i++) {
    users.push({
      email: `test` + i + `@gmail.com`,
      password: hashedPassword,
      firstName: `Test`,
      lastName: `User` + i,
      isVerified: true,
      gender: Gender.MALE,
    });
  }
  return users;
};

const genEventList = () => {
  const now = new Date();
  const endDay = new Date();
  endDay.setMonth(endDay.getMonth() + 1);
  const rs = [
    {
      id: 'testEvent1',
      startSellDate: now,
      endSellDate: endDay,
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 10,
    },
    {
      id: 'testEvent2',
      startSellDate: now,
      endSellDate: endDay,
      isFree: true,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: 20,
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
      name: 'Test event 1',
      description: 'Test description',
      startDate: now,
      endDate: endDate,
      location: 'Test location',
      thumbnail: 'Test thumbnail',
      eventId: 'testEvent1',
      organizerId: 'testOrganizer1',
    },
    {
      name: 'Test event 2',
      description: 'Test description',
      startDate: now,
      endDate: endDate,
      location: 'Test location',
      thumbnail: 'Test thumbnail',
      eventId: 'testEvent2',
      organizerId: 'testOrganizer1',
    },
  ];
  return rs;
};

const genTicketClassList = () => {
  const rs = [
    {
      id: 'testTicketClass1Event1',
      name: 'Test ticket class 1',
      description: 'Test description',
      price: 100,
      totalQuantity: 100,
      eventId: 'testEvent1',
    },
    {
      id: 'testTicketClass2Event1',
      name: 'Test ticket class 2',
      description: 'Test description',
      price: 200,
      totalQuantity: 200,
      eventId: 'testEvent1',
    },
    {
      id: 'testTicketClass1Event2',
      name: 'Test ticket class 1',
      description: 'Test description',
      price: 100,
      totalQuantity: 100,
      eventId: 'testEvent2',
    },
    {
      id: 'testTicketClass2Event2',
      name: 'Test ticket class 2',
      description: 'Test description',
      price: 200,
      totalQuantity: 200,
      eventId: 'testEvent2',
    },
  ];
  return rs;
};

async function main() {
  console.log('Seeding data...');
  await prisma.organizer.createManyAndReturn({
    data: {
      id: 'testOrganizer1',
      name: 'Test organizer 1',
      description: 'Test description',
    },
  });
  await prisma.user.createManyAndReturn({
    data: genUserList(),
  });
  await prisma.event.createManyAndReturn({
    data: genEventList(),
  });
  await prisma.eventInfo.createManyAndReturn({
    data: genEventInfoList(),
  });
  await prisma.ticketClass.createManyAndReturn({
    data: genTicketClassList(),
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
