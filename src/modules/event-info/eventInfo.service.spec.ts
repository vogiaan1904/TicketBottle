import { Test, TestingModule } from '@nestjs/testing';
import { EventInfoService } from './event-info.service';

describe('EventInfoService', () => {
  let service: EventInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventInfoService],
    }).compile();

    service = module.get<EventInfoService>(EventInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
