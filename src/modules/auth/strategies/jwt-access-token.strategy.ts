import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token.interface';
import { accessTokenKeyPair } from 'src/constraints/jwt.constraints';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: accessTokenKeyPair.publicKey,
    });
  }

  async validate(payload: TokenPayload) {
    return await this.userService.findOne({ id: payload.userID });
  }
}
