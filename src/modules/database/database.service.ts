import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
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
      this.appLogger.log('Connected to database successfully');
      await this.createAdminAccount();
    } catch (error) {
      this.appLogger.error('Failed to connect to database', error);
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
      this.appLogger.log('Admin account is found');
      return;
    }
    this.appLogger.error(
      'Admin account is not found. Creating admin account...',
    );
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await this.staff.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    this.appLogger.log('Create admin account successfully');
  }
}
