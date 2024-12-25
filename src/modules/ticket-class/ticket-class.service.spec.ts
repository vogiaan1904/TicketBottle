import { Test, TestingModule } from '@nestjs/testing';
import { TicketClassService } from './ticket-class.service';

describe('TicketClassService', () => {
  let service: TicketClassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketClassService],
    }).compile();

    service = module.get<TicketClassService>(TicketClassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
