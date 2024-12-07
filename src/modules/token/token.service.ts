import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignTokenWithSecretInterface } from './interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signJwtWithSecret({
    payload,
    secret,
    exp,
  }: SignTokenWithSecretInterface): string {
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: exp,
    });
  }

  async verifyJwtWithSecret(token: string, secret: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, { secret });
      return true;
    } catch {
      return false;
    }
  }

  signJwt(payload: object, exp: string): string {
    return this.jwtService.sign(payload, {
      expiresIn: exp,
    });
  }

  async verifyJwt(token: string): Promise<boolean> {
    try {
      await this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }
}
