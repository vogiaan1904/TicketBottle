import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalStaffAuthGuard extends AuthGuard('local-staff') {}
