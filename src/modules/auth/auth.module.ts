import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { StaffModule } from '../staff/staff.module';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { AuthStaffController } from './auth-staff.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStaffAccessStrategy } from './strategies/jwt-access/jwt-staff-access-token.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access/jwt-user-access-token.strategy';
import { JwtStaffRefreshTokenStrategy } from './strategies/jwt-refresh/jwt-staff-refresh-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh/jwt-user-refresh-token.strategy';
import { LocalStaffStrategy } from './strategies/local/local-staff.strategy';
import { LocalUserStrategy } from './strategies/local/local-user.strategy';
import { GoogleStrategy } from './strategies/oauth/google.strategy';

@Module({
  imports: [
    UserModule,
    EmailModule,
    PassportModule,
    TokenModule,
    StaffModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController, AuthStaffController],
  providers: [
    AuthService,
    LocalStaffStrategy,
    LocalUserStrategy,
    JwtAccessTokenStrategy,
    JwtStaffAccessStrategy,
    JwtRefreshTokenStrategy,
    JwtStaffRefreshTokenStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
