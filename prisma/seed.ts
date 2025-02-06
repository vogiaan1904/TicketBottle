import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { Category, EventStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getEventCategory = (name: string, description: string): Category[] => {
  const text = (name + ' ' + description).toLowerCase();
  const categories = [];
  if (/(concert|show|nhạc|fan meeting|music|dazzling)/.test(text))
    categories.push('MUSIC');
  if (/(theater|art|live)/.test(text)) categories.push('THEATERS_AND_ART');
  if (/(sport|match|tournament|game)/.test(text)) categories.push('SPORTS');
  if (categories.length == 0) categories.push('OTHER');
  return categories;
};

const genEventList = (numEvents: number) => {
  const rs = [];

  for (let i = 1; i <= numEvents; i++) {
    // Random date between now and July 2025
    const endDate = new Date('2025-07-31');
    const startDate = new Date();
    const randomDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime()),
    );

    // End sell date is 1 day before random date
    const endSellDate = new Date(randomDate);
    endSellDate.setDate(endSellDate.getDate() - 1);

    // Start sell date is 7 days before end sell date
    const startSellDate = new Date(endSellDate);
    startSellDate.setDate(startSellDate.getDate() - 7);

    rs.push({
      id: `mockEvent${i}`,
      startSellDate,
      endSellDate,
      isFree: false,
      status: EventStatus.DRAFT,
      maxTicketsPerCustomer: Math.floor(Math.random() * 6) + 5, // Random number between 5-10
    });
  }

  return rs.map((event) => ({
    ...event,
    categories: getEventCategory(event.name, event.description),
  }));
};

const updateEventCategories = async () => {
  const eventsToUpdate = await prisma.event.findMany({
    include: {
      eventInfo: true,
    },
  });
  for (const event of eventsToUpdate) {
    if (event.eventInfo) {
      const categories = getEventCategory(
        event.eventInfo.name,
        event.eventInfo.description,
      );
      await prisma.event.update({
        where: { id: event.id },
        data: {
          categories: categories,
        },
      });
      console.log(`Updated event ${event.id} with categories:`, categories);
    }
  }
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
      name: '[Đà Nẵng] Những Thành Phố Mơ Màng Year End 2025',
      description:
        'A dazzling year-end celebration in Da Nang featuring spectacular live performances.',
      startDate: new Date('2025-11-30T08:00:00Z'),
      endDate: new Date(
        new Date('2025-11-30T08:00:00Z').getTime() + 60 * 60 * 1000,
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
      startDate: new Date('2025-11-30T10:30:00Z'),
      endDate: new Date(
        new Date('2025-11-30T10:30:00Z').getTime() + 90 * 60 * 1000,
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
      startDate: new Date('2025-11-30T11:00:00Z'),
      endDate: new Date(
        new Date('2025-11-30T11:00:00Z').getTime() + 60 * 60 * 1000,
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
      startDate: new Date('2025-11-30T12:00:00Z'),
      endDate: new Date(
        new Date('2025-11-30T12:00:00Z').getTime() + 60 * 60 * 1000,
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
      startDate: new Date('2025-11-30T12:30:00Z'),
      endDate: new Date(
        new Date('2025-11-30T12:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/21/28/82/c9a75f04cd4d1df3727831d9b2d25a1f.jpg',
      eventId: 'mockEvent16',
      organizerId: 'mockOrganizer4',
    },
    {
      name: '2025 SOOBIN Fan Meeting In HCMC: PROMise',
      description:
        'Connect with Soobin at an exclusive fan meeting event in Ho Chi Minh City.',
      startDate: new Date('2025-12-04T08:00:00Z'),
      endDate: new Date(
        new Date('2025-12-04T08:00:00Z').getTime() + 90 * 60 * 1000,
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
      startDate: new Date('2025-12-06T21:30:00Z'),
      endDate: new Date(
        new Date('2025-12-06T21:30:00Z').getTime() + 60 * 60 * 1000,
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
      startDate: new Date('2025-12-07T07:00:00Z'),
      endDate: new Date(
        new Date('2025-12-07T07:00:00Z').getTime() + 60 * 60 * 1000,
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
      startDate: new Date('2025-12-07T12:00:00Z'),
      endDate: new Date(
        new Date('2025-12-07T12:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/a6/6d/40/709fac7f03cb28af066df0c0848103b9.jpg',
      eventId: 'mockEvent20',
      organizerId: 'mockOrganizer6',
    },
    {
      name: 'LULULOLA SHOW VĂN MAI HƯƠNG | CẦU VỒNG LẤP LÁNH',
      description: 'No description provided.',
      startDate: new Date('2025-11-16T10:30:00Z'),
      endDate: new Date(
        new Date('2025-11-16T10:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Unknown',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/52/11/c4/31d9cd01a9c9055f89af4ea38cee7e2e.png',
      eventId: 'mockEvent21',
      organizerId: 'mockOrganizer1',
    },
    {
      name: 'CHỐN...TÌM CHẶNG 7 I "SAU NÀY CỦA CHÚNG TA" - LÊ HIẾU, VICKY NHUNG',
      description: 'No description provided.',
      startDate: new Date('2025-11-14T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-14T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Unknown',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/a1/19/f5/1e5bf62d8e01f93d7d3b818ef1b2d274.jpg',
      eventId: 'mockEvent22',
      organizerId: 'mockOrganizer2',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Trung Quân - Văn Mai Hương',
      description: 'No description provided.',
      startDate: new Date('2025-11-11T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-11T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Unknown',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/f1/65/d8/96ba79bf830728e6cc1bdcb6e3dccb9b.jpg',
      eventId: 'mockEvent23',
      organizerId: 'mockOrganizer3',
    },
    {
      name: 'DeloDelo Show : Liveshow "Yêu Là Như Thế" - Hương Tràm & Phạm Anh Duy [Hà Nội]',
      description: 'No description provided.',
      startDate: new Date('2025-11-10T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-10T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/e0/6c/11/476dd7a3771a5b1ef1ae11631a7cb724.jpg',
      eventId: 'mockEvent24',
      organizerId: 'mockOrganizer4',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Phương Anh - Phương Ý. KM: Thành Nguyên',
      description: 'No description provided.',
      startDate: new Date('2025-11-09T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-09T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Unknown',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/46/ce/d3/02347946c599ff11543646971175fe7c.jpg',
      eventId: 'mockEvent25',
      organizerId: 'mockOrganizer5',
    },
    {
      name: 'LULULOLA SHOW ANH TÚ - LYLY | ',
      description: 'No description provided.',
      startDate: new Date('2025-11-09T10:30:00Z'),
      endDate: new Date(
        new Date('2025-11-09T10:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/28/2f/be/1c9c62eaa0798a8b35cc9547ca715c65.png',
      eventId: 'mockEvent26',
      organizerId: 'mockOrganizer6',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Birthday show Bạch Công Khanh',
      description: 'No description provided.',
      startDate: new Date('2025-11-08T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-08T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/41/3e/a5/2c89ef3e4259cbb89b0c49656520ebb8.jpg',
      eventId: 'mockEvent27',
      organizerId: 'mockOrganizer1',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Hà Nhi - Hà An Huy',
      description: 'No description provided.',
      startDate: new Date('2025-11-03T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-03T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/d3/51/5d/f7ec2718c359db8b85c5f7c9fcd2b536.jpg',
      eventId: 'mockEvent28',
      organizerId: 'mockOrganizer2',
    },
    {
      name: 'Hanoi - The Bootleg Beatles',
      description: 'No description provided.',
      startDate: new Date('2025-11-03T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-03T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/83/b3/0f/835ba6bec6145b26b213cd727f2b53a0.png',
      eventId: 'mockEvent29',
      organizerId: 'mockOrganizer3',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Quang Dũng - Ngọc Anh',
      description: 'No description provided.',
      startDate: new Date('2025-11-02T13:00:00Z'),
      endDate: new Date(
        new Date('2025-11-02T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/2d/6e/24/8c3dce65928e2486d6e6e7147313252c.jpg',
      eventId: 'mockEvent30',
      organizerId: 'mockOrganizer4',
    },
    {
      name: '[LULULOLA SHOW] TRUNG QUÂN | BUỒN KHÔNG THỂ BUÔNG',
      description: 'No description provided.',
      startDate: new Date('2025-11-02T10:30:00Z'),
      endDate: new Date(
        new Date('2025-11-02T10:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/69/21/be/88a283f7f47bbfedb6e6543641285e15.png',
      eventId: 'mockEvent31',
      organizerId: 'mockOrganizer5',
    },
    {
      name: '2025 Jun Phạm Fan Meeting <JUNIVERSE in HCM>',
      description: 'No description provided.',
      startDate: new Date('2025-11-01T11:30:00Z'),
      endDate: new Date(
        new Date('2025-11-01T11:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/8b/7e/3d/d210532302d1a7fc334f42e56e491868.png',
      eventId: 'mockEvent32',
      organizerId: 'mockOrganizer6',
    },
    {
      name: 'Huyền Bí Đêm Halloween cùng Vạn Phúc WaterShow',
      description: 'No description provided.',
      startDate: new Date('2025-10-31T12:30:00Z'),
      endDate: new Date(
        new Date('2025-10-31T12:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/e0/e4/ca/3d266a915271f39057d4da6d83c60aef.jpg',
      eventId: 'mockEvent33',
      organizerId: 'mockOrganizer2',
    },
    {
      name: 'Mini Show Quang Dũng - Hải Phòng - 26/10/2025',
      description: 'No description provided.',
      startDate: new Date('2025-10-26T13:00:00Z'),
      endDate: new Date(
        new Date('2025-10-26T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hải Phòng, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/92/11/0a/6d80281b745c43b1d1c3b7562a11a25c.jpg',
      eventId: 'mockEvent34',
      organizerId: 'mockOrganizer3',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Chu Thúy Quỳnh - Nguyễn Kiều Oanh',
      description: 'No description provided.',
      startDate: new Date('2025-10-26T13:00:00Z'),
      endDate: new Date(
        new Date('2025-10-26T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/1f/b9/b8/e102bef22d5b6df8ce8e8fc7a57517be.jpg',
      eventId: 'mockEvent35',
      organizerId: 'mockOrganizer4',
    },
    {
      name: '[Hà Nội] Vũ. - "Bảo Tàng của Nuối Tiếc" Live Concert 2025',
      description: 'No description provided.',
      startDate: new Date('2025-10-26T13:00:00Z'),
      endDate: new Date(
        new Date('2025-10-26T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/fa/e4/94/4638917f282430a51497c965b83b427f.png',
      eventId: 'mockEvent36',
      organizerId: 'mockOrganizer5',
    },
    {
      name: 'Huyền Bí Đêm Halloween Cùng Vạn Phúc Watershow',
      description: 'No description provided.',
      startDate: new Date('2025-10-26T12:30:00Z'),
      endDate: new Date(
        new Date('2025-10-26T12:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Hanoi, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/c3/e4/8d/85680dc44d2164d5be734c1dc8fd2cb8.jpg',
      eventId: 'mockEvent37',
      organizerId: 'mockOrganizer6',
    },
    {
      name: 'LULULOLA SHOW VŨ CÁT TƯỜNG | TỪNG LÀ',
      description: 'No description provided.',
      startDate: new Date('2025-10-26T10:30:00Z'),
      endDate: new Date(
        new Date('2025-10-26T10:30:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/d2/9f/04/102e3246bb550d318ec24deb881472fa.png',
      eventId: 'mockEvent38',
      organizerId: 'mockOrganizer1',
    },
    {
      name: 'Nhớ Trịnh Công Sơn 3 - Quang Dũng - Cẩm Vân - Khắc Triệu - Cece Trương',
      description: 'No description provided.',
      startDate: new Date('2025-10-25T13:00:00Z'),
      endDate: new Date(
        new Date('2025-10-25T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/1d/15/98/f3e4a9be42a3368c63a5c179d2c38b5f.jpg',
      eventId: 'mockEvent39',
      organizerId: 'mockOrganizer2',
    },
    {
      name: 'THE ARTS OF THE CONCERTO - THE 3RD INTERNALTIONAL CLASSICAL MUSIC FESTIVAL',
      description: 'No description provided.',
      startDate: new Date('2025-10-21T13:00:00Z'),
      endDate: new Date(
        new Date('2025-10-21T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/92/5d/eb/ef7e3815e1eb993f802bfc14978907a3.png',
      eventId: 'mockEvent40',
      organizerId: 'mockOrganizer3',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Cẩm Vân - Khắc Triệu - Cece Trương - Nguyễn Đình Tuấn Dũng - Nguyễn Kiều Oanh',
      description: 'No description provided.',
      startDate: new Date('2025-10-20T13:00:00Z'),
      endDate: new Date(
        new Date('2025-10-20T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/d7/32/40/bffa841ee7a24ec895aaa8e63f64531c.jpg',
      eventId: 'mockEvent41',
      organizerId: 'mockOrganizer4',
    },
    {
      name: '[BẾN THÀNH] Đêm nhạc Hồ Quỳnh Hương - Trung Quân',
      description: 'No description provided.',
      startDate: new Date('2025-10-19T13:00:00Z'),
      endDate: new Date(
        new Date('2025-10-19T13:00:00Z').getTime() + 60 * 60 * 1000,
      ),
      location: 'Ho Chi Minh City, Vietnam',
      thumbnail:
        'https://images.tkbcdn.com/2/608/332/ts/ds/b1/16/95/3e1bec90125443f37bd8b11b5175f60b.jpg',
      eventId: 'mockEvent42',
      organizerId: 'mockOrganizer5',
    },
  ];
  return rs;
};

const genTicketClassList = (numEvents: number) => {
  const rs = [];
  const possiblePrices = [199000, 249000, 299000, 500000, 699000];

  for (let i = 1; i <= numEvents; i++) {
    // Standard ticket class
    rs.push({
      id: `testTicketClass1Event${i}`,
      name: 'Standard',
      description: 'Standard entry ticket with access to all general areas.',
      price: possiblePrices[Math.floor(Math.random() * possiblePrices.length)],
      totalQuantity: Math.floor(Math.random() * (700 - 100 + 1)) + 100, // Random between 100-700
      eventId: `mockEvent${i}`,
    });

    // VIP ticket class
    rs.push({
      id: `testTicketClass2Event${i}`,
      name: 'VIP',
      description: 'VIP access with premium facilities and exclusive benefits.',
      price: possiblePrices[Math.floor(Math.random() * possiblePrices.length)],
      totalQuantity: Math.floor(Math.random() * (700 - 100 + 1)) + 100, // Random between 100-700
      eventId: `mockEvent${i}`,
    });
  }

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
  const events = genEventList(42);
  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }

  await updateEventCategories();

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
  const ticketClasses = genTicketClassList(42);
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
