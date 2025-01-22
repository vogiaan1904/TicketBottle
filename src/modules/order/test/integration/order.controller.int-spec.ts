import { AppModule } from '@/app.module';
import { DatabaseService } from '@/modules/database/database.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { OrderController } from '../../order.controller';

describe('OrderController', () => {
  let orderController: OrderController;
  let databaseService: DatabaseService;
  let cacheService: Cache;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    orderController = moduleRef.get<OrderController>(OrderController);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
    cacheService = moduleRef.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(orderController).toBeDefined();
  });
  // describe('createOrder', () => {
  //   it('should create order successfully', async () => {
  //     const order = {
  //       userId: 'testUser1',
  //       ticketClassId: 'testTicketClass1Event1',
  //       quantity: 10,
  //     };
  //     const result = await orderController.createOrder(order);
  //     expect(result).toBeDefined();
  //   });
  // });
});
