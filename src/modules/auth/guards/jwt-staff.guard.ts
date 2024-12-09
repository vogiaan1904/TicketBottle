import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtStaffTokenGuard extends AuthGuard('jwt-staff') {}
