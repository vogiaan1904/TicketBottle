import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { StaffService } from '@/modules/staff/staff.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../interfaces/token.interface';

@Injectable()
export class JwtStaffAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-staff',
) {
  constructor(
    private readonly staffService: StaffService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET_KEY'),
    });
  }

  async validate(payload: TokenPayload) {
    const staff = await this.staffService.findOne({ id: payload.userID });
    if (!staff) {
      throw new UnauthorizedException('Staff not found');
    }
    return staff;
  }
}
