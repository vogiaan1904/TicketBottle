import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { instance as logger } from '../../configs/winston.config';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed', error);
    }
  }
}
