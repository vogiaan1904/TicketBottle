import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { RegisterRequestDTO } from './dto/request/register.request.dto';
import { User } from '@prisma/client';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginResponseDTO } from './dto/response/login.response.dto';

import {
  ResetPasswordTokenPayload,
  TokenPayload,
  VerifyAccountTokenPayload,
} from './interfaces/token.interface';
import { Cache } from 'cache-manager';
import {
  accessTokenKeyPair,
  refreshTokenKeyPair,
} from 'src/constraints/jwt.constraints';
import { TokenService } from '../token/token.service';
import { VerifyAccountRequestDTO } from './dto/request/verifyAccount.request.dto';
import { ResetPasswordRequestDTO } from './dto/request/resetPassword.request.dto';

@Injectable()
export class AuthService {
  private SALT_ROUND = 10;
  private readonly FORGOT_PASSWORD_EXPIRATION_TIME = '15mins';
  private readonly VERIFY_ACCOUNT_EXPIRATION_TIME = '15mins';
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,

    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  private async verifyPlainContentWithHashedContent(
    plainText: string,
    hashedText: string,
  ): Promise<void> {
    const is_matching = await bcrypt.compare(plainText, hashedText);
    if (!is_matching) {
      throw new BadRequestException();
    }
  }

  async register(dto: RegisterRequestDTO): Promise<User> {
    const isExist = await this.userService.findOne({ email: dto.email });
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUND);

    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });
    return newUser;
  }

  async login(userID: string): Promise<LoginResponseDTO> {
    const accessToken = this.generateAccessToken({
      userID,
    });
    const refreshToken = this.generateRefreshToken({
      userID,
    });
    await this.storeRefreshToken(userID, refreshToken);
    return { accessToken, refreshToken };
  }

  async getAuthenticatedUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.verifyPlainContentWithHashedContent(password, user.password);
    return user;
  }

  async getUserIfRefreshTokenMatched(
    userID: string,
    refreshToken: string,
  ): Promise<User> {
    this.logger.log(userID);
    const user = await this.userService.findOne({ id: userID });
    if (!user) {
      throw new UnauthorizedException();
    }

    const currentRefreshToken = await this.cacheService.get<string>(userID);
    await this.verifyPlainContentWithHashedContent(
      refreshToken,
      currentRefreshToken,
    );
    return user;
  }

  generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: accessTokenKeyPair.privateKey,
      expiresIn: `${this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: refreshTokenKeyPair.privateKey,
      expiresIn: `${this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
  }

  async storeRefreshToken(user_id: string, token: string): Promise<void> {
    const hashedToken = await bcrypt.hash(token, this.SALT_ROUND);
    await this.cacheService.set(
      user_id,
      hashedToken,
      this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    );
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOne({ email });
    const payload: ResetPasswordTokenPayload = {
      email,
    };

    const resetPasswordToken = await this.tokenService.signJwtWithSecret({
      payload,
      secret: user.password,
      exp: this.FORGOT_PASSWORD_EXPIRATION_TIME,
    });

    await this.emailService.sendUserResetPasswordEmail(
      email,
      resetPasswordToken,
    );
  }

  async resetPassword(dto: ResetPasswordRequestDTO): Promise<void> {
    const decoded = await this.jwtService.decode(dto.token);
    const user = await this.userService.findOne({ email: decoded.email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValidToken = await this.tokenService.verifyJwtWithSecret(
      dto.token,
      user.password,
    );

    if (!isValidToken) {
      throw new BadRequestException('Invalid token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, this.SALT_ROUND);
    await this.userService.update(
      { id: user.id },
      { password: hashedPassword },
    );
  }

  async verifyAccount(dto: VerifyAccountRequestDTO): Promise<void> {
    const decoded = await this.jwtService.decode(dto.token);
    const user = await this.userService.findOne(decoded.email);

    if (user.isVerified) {
      throw new BadRequestException('Account already verifed');
    }

    const isValidToken = await this.tokenService.verifyJwtWithSecret(
      dto.token,
      user.password + user.isVerified,
    );

    if (!isValidToken) {
      throw new BadRequestException('Invalid token');
    }

    await this.userService.update({ id: user.id }, { isVerified: true });
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findOne({ email });

    if (user.isVerified) {
      throw new BadRequestException('Account already verifed');
    }

    const payload: VerifyAccountTokenPayload = {
      email,
    };

    const verifyToken = await this.tokenService.signJwtWithSecret({
      payload,
      secret: user.password + user.isVerified,
      exp: this.VERIFY_ACCOUNT_EXPIRATION_TIME,
    });

    await this.emailService.sendUserVerifyEmail(email, verifyToken);
  }
}
