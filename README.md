## TicketBottle

Authors: [vogiaan1904](https://github.com/vogiaan1904), [phamnguyenviethung](https://github.com/phamnguyenviethung)

<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Overview

TicketBottle is a comprehensive ticket selling and management system built on [NestJS](https://github.com/nestjs/nest). It leverages modern backend technologies such as [Prisma](https://github.com/prisma/prisma) for type-safe database access, [BullMQ](https://github.com/taskforcesh/bullmq) for processing background jobs, and [jsPDF](https://github.com/parallax/jsPDF) for generating ticket PDFs with embedded QR codes. The system supports dynamic event creation, robust order processing, and real-time notifications.

## Features

- **Event & Ticket Management:**  
  Create, update, and manage events with a dynamic ticketing mechanism. Each ticket features secure QR code generation and is available in multiple classes (e.g., Standard, VIP).

- **Order Processing & PDF Generation:**  
  When a ticket order is placed, the system generates a PDF receipt containing order details and QR codes (see [`src/modules/order/order.service.ts`](src/modules/order/order.service.ts)).

- **Background Processing:**  
  Uses BullMQ to handle ticket release and other background jobs reliably. Logging and exception handling are managed using [Winston](https://github.com/winstonjs/winston) for robust error tracking.

- **Email Notifications:**  
  Templates for transactional emails reside in [`src/templates/auth/welcome.pug`](src/templates/auth/welcome.pug) and similar files.

- **Dockerized Setup:**  
  Easily run and deploy using Docker. Environment configuration is available via `.env`, `.env.dev`, and `.env.prod`.

## Installation

1. **Clone the repository:**

```sh
git clone https://github.com/vogiaan1904/TicketBottle.git
cd TicketBottle
```

2. **Install dependencies:**

```sh
npm install
```

3. **Configure environment variables:**
   Create your own `.env` file based on the provided `.env.example`.

4. **Database setup:**
   Run Prisma migrations:

```sh
npx prisma migrate dev
```

(Optional) Seed the database by running the seed script:

```sh
npx ts-node prisma/seed.ts
```

5. **Start the application:**

For development:

```sh
npm run start:dev
```

Using Docker (example for development):

```sh
docker-compose -f docker-compose.dev.yml up --build
```

## API Documentation

The API documentation can be accessed at `/api-docs#`. You can view the list of available APIs and their specifications by running the server and visiting `http://localhost:3000/api-docs#/` in your browser.

## License

TicketBottle is [MIT licensed]. See the [LICENSE](LICENSE) for details
