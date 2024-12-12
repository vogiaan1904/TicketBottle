import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { StaffService } from '@/modules/staff/staff.service';
import { accessTokenKeyPair } from 'src/constraints/jwt.constraints';
import { TokenPayload } from '../../interfaces/token.interface';

@Injectable()
export class JwtStaffAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-staff',
) {
  constructor(private readonly staffService: StaffService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenKeyPair.publicKey,
    });
  }

  async validate(payload: TokenPayload) {
    const staff = await this.staffService.findOne({ id: payload.userID });
    console.log('staff', staff);
    if (!staff) {
      throw new UnauthorizedException('Staff not found');
    }
    return staff;
  }
}
