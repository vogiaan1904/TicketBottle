import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../../auth.service';
import { TokenPayload } from '../../interfaces/token.interface';
import { refreshTokenKeyPair } from 'src/constraints/jwt.constraints';

@Injectable()
export class JwtStaffRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'staff-refresh-token',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: refreshTokenKeyPair.publicKey,
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
