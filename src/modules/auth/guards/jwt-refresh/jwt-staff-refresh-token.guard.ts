import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtStaffRefreshTokenGuard extends AuthGuard(
  'staff-refresh-token',
) {}
