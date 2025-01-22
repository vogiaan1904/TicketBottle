import { EventStatus, Gender, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const defaultPassword = '123';

const genUserList = (count: number = 100) => {
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
      status: EventStatus.PUBLISHED,
      maxTicketsPerCustomer: 10,
    },
    {
      id: 'testEvent2',
      startSellDate: new Date(),
      endSellDate: new Date(),
      isFree: true,
      status: EventStatus.PUBLISHED,
      maxTicketsPerCustomer: 10,
    },
  ];

  return rs;
};

async function main() {
  await prisma.user.createManyAndReturn({
    data: genUserList(),
  });
  await prisma.event.createManyAndReturn({
    data: genEventList(),
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
