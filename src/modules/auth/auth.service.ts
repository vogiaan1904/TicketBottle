import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import {
  RegisterRequestDTO,
  RegisterWithGoogleRequestDTO,
} from './dto/request/register.request.dto';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginResponseDTO } from './dto/response/login.response.dto';

import { logger } from '@/configs/winston.config';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { StaffResponseDto } from '../staff/dto/staff.response.dto';
import { StaffService } from '../staff/staff.service';
import { TokenService } from '../token/token.service';
import { UserResponseDto } from '../user/dto/user.response.dto';
import { ResetPasswordRequestDTO } from './dto/request/resetPassword.request.dto';
import { RegisterResponseDTO } from './dto/response/register.response.dto';
import {
  ResetPasswordTokenPayload,
  TokenPayload,
  VerifyAccountTokenPayload,
} from './interfaces/token.interface';

@Injectable()
export class AuthService {
  private SALT_ROUND = 10;
  private readonly FORGOT_PASSWORD_EXPIRATION_TIME = '15mins';
  private readonly VERIFY_ACCOUNT_EXPIRATION_TIME = '15mins';
  private readonly logger = logger.child({ context: AuthService.name });
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly staffService: StaffService,

    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  private async verifyPlainContentWithHashedContent(
    plainText: string,
    hashedText: string,
  ): Promise<void> {
    const is_matching = await bcrypt.compare(plainText, hashedText);
    if (!is_matching) {
      throw new BadRequestException("Email or password doesn't match");
    }
  }

  async register(dto: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    const isExist = await this.userService.findByEmail(dto.email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUND);

    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    await this.sendVerificationEmail(newUser.email);
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

  async getAuthenticatedUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.isVerified) {
      throw new BadRequestException('User not verified');
    }
    await this.verifyPlainContentWithHashedContent(password, user.password);
    return user;
  }

  async validateGoogleLogin(
    userDetails: RegisterWithGoogleRequestDTO,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findByEmail(userDetails.email);
    if (user) return user;
    else {
      const password = crypto.randomBytes(10).toString('hex');
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUND);

      const newUser = await this.userService.create({
        ...userDetails,
        password: hashedPassword,
        isVerified: true,
      });
      return newUser;
    }
  }

  async getStaff(
    username: string,
    password: string,
  ): Promise<StaffResponseDto> {
    const staff = await this.staffService.findOne({ username });
    if (!staff) {
      throw new BadRequestException('Staff not found');
    }
    await this.verifyPlainContentWithHashedContent(password, staff.password);
    return staff;
  }

  async getUserIfRefreshTokenMatched(
    userID: string,
    refreshToken: string,
  ): Promise<UserResponseDto> {
    this.logger.info(userID);
    const user = await this.userService.findById(userID);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const currentRefreshToken = await this.cacheService.get<string>(userID);
    if (!currentRefreshToken) {
      throw new BadRequestException('Invalid token');
    }
    await this.verifyPlainContentWithHashedContent(
      refreshToken,
      currentRefreshToken,
    );
    return user;
  }

  async getStaffIfRefreshTokenMatched(
    staffId: string,
    refreshToken: string,
  ): Promise<StaffResponseDto> {
    this.logger.info(staffId);
    const staff = await this.staffService.findOne({ id: staffId });
    if (!staff) {
      throw new BadRequestException('Staff not found');
    }

    const currentRefreshToken = await this.cacheService.get<string>(staffId);

    if (!currentRefreshToken) {
      throw new BadRequestException('Invalid token');
    }

    await this.verifyPlainContentWithHashedContent(
      refreshToken,
      currentRefreshToken,
    );
    return staff;
  }

  generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS256',
      secret: this.configService.get<string>('JWT_ACCESS_SECRET_KEY'),
      expiresIn: `${this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS256',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
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
    const user = await this.userService.findByEmail(email);
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
    const user = await this.userService.findByEmail(decoded.email);
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

  async verifyAccount(token: string): Promise<void> {
    const decoded = await this.jwtService.decode(token);
    const user = await this.userService.findByEmail(decoded.email);

    if (user.isVerified) {
      throw new BadRequestException('Account already verified');
    }

    const isValidToken = await this.tokenService.verifyJwtWithSecret(
      token,
      user.password + user.isVerified,
    );

    if (!isValidToken) {
      throw new BadRequestException('Invalid token');
    }

    await this.userService.update({ id: user.id }, { isVerified: true });
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    const fullName = `${user.firstName} ${user.lastName}`;

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

    await this.emailService.sendUserVerifyEmail(email, fullName, verifyToken);
  }
}
