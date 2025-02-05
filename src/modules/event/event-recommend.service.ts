import { ConfigService } from '@nestjs/config';

export class EventRecommendService {
  constructor(private readonly configService: ConfigService) {}
  async getRecommendEvents() {
    return [];
  }
}
