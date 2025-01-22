import { Test, TestingModule } from '@nestjs/testing';
import { OrganizerController } from './organizer.controller';

describe('OrganizerController', () => {
  let controller: OrganizerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizerController],
    }).compile();

    controller = module.get<OrganizerController>(OrganizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
