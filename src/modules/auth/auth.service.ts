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
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { User } from '@prisma/client';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginResponseDTO } from './dto/response/login.response.dto';
import {
  access_token_private_key,
  refresh_token_private_key,
} from 'src/constraints/jwt.constraints';
import { TokenPayload } from './interfaces/token.interface';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private SALT_ROUND = 10;
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async register(dto: RegisterRequestDto): Promise<User> {
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

  private async verifyPlainContentWithHashedContent(
    plainText: string,
    hashedText: string,
  ): Promise<void> {
    const is_matching = await bcrypt.compare(plainText, hashedText);
    if (!is_matching) {
      throw new BadRequestException();
    }
  }

  generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: access_token_private_key,
      expiresIn: `${this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: refresh_token_private_key,
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
}
