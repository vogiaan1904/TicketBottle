import { Test, TestingModule } from '@nestjs/testing';
import { TicketClassController } from './ticket-class.controller';
import { TicketClassService } from './ticket-class.service';

describe('TicketClassController', () => {
  let controller: TicketClassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketClassController],
      providers: [TicketClassService],
    }).compile();

    controller = module.get<TicketClassController>(TicketClassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
