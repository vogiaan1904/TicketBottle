import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth.service';
import { TokenPayload } from '../../interfaces/token.interface';

@Injectable()
export class JwtStaffRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'staff-refresh-token',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET_KEY'),
      passReqToCallback: true,
    });
  }
  Í;
  async validate(request: Request, payload: TokenPayload) {
    return await this.authService.getStaffIfRefreshTokenMatched(
      payload.userID,
      request.body.refreshToken,
    );
  }
}
