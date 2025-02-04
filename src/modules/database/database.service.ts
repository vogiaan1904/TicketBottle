import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/configs/winston.config';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly logger = logger.child({ context: DatabaseService.name });
  constructor() {
    super();
  }
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.info('Connected to database successfully');
      await this.createAdminAccount();
    } catch (error) {
      this.logger.error('Failed to initialzie the database: ', error);
      throw new InternalServerErrorException(error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') return;
    const models = Reflect.ownKeys(this).filter(
      (key) =>
        key[0] !== '_' &&
        typeof key === 'string' &&
        /^[a-z]/.test(key) &&
        typeof this[key].deleteMany === 'function',
    );

    return Promise.all(
      models.map((model) => {
        return this[model].deleteMany({});
      }),
    );
  }

  async createAdminAccount() {
    const existedAdmin = await this.staff.findFirst({
      where: {
        username: 'admin',
      },
    });
    if (existedAdmin) {
      this.logger.info('Admin account is found');
      return;
    }
    this.logger.error('Admin account is not found. Creating admin account...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await this.staff.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    this.logger.info('Create admin account successfully');
  }
}
