import { Test, TestingModule } from '@nestjs/testing';
import { EventInfoController } from './event-info.controller';

describe('EventInfoController', () => {
  let controller: EventInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventInfoController],
    }).compile();

    controller = module.get<EventInfoController>(EventInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
