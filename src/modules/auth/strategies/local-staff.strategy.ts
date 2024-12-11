import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStaffStrategy extends PassportStrategy(
  Strategy,
  'local-staff',
) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string) {
    const staff = await this.authService.getStaff(username, password);
    console.log(staff);
    return staff;
  }
}
