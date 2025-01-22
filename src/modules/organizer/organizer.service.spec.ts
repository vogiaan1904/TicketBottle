import { Test, TestingModule } from '@nestjs/testing';
import { OrganizerService } from './organizer.service';

describe('OrganizerService', () => {
  let service: OrganizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizerService],
    }).compile();

    service = module.get<OrganizerService>(OrganizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
