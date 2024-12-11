import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtStaffAccessTokenGuard extends AuthGuard('jwt-staff') {}
