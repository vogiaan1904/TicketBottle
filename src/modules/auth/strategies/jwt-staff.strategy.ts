import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { StaffTokenPayload } from '../interfaces/token.interface';
import { refreshTokenKeyPair } from 'src/constraints/jwt.constraints';
import { EventService } from '@/modules/event/event.service';

@Injectable()
export class JwtStaffStrategy extends PassportStrategy(Strategy, 'jwt-staff') {
  constructor(
    private readonly authService: AuthService,
    private readonly eventService: EventService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshTokenKeyPair.publicKey,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: StaffTokenPayload) {
    const event = await this.eventService.findOne({
      id: payload.eventID,
      staffUsername: payload.staffUsername,
    });

    if (!event) {
      return null;
    }
    return { ...payload };
  }
}
