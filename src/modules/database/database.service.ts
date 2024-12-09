import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor(private readonly logger: Logger) {
    super();
  }
  private appLogger = new Logger(DatabaseService.name);
  async onModuleInit() {
    try {
      await this.$connect();
      this.appLogger.log('Database connected successfully');
    } catch (error) {
      this.appLogger.error('Database connection failed', error);
    }
  }
}
