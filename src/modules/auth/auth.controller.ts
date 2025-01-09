import { Body, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { ApiPost } from 'src/decorators/apiPost.decorator';
import { RequestWithUser } from 'src/types/request.type';
import { StaffService } from '../staff/staff.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ForgotPasswordRequestDTO } from './dto/request/forgotPassword.request.dto';
import { LoginRequestDTO } from './dto/request/login.request.dto';
import { RefreshTokenRequestDTO } from './dto/request/refreshToken.request.dto';
import { RegisterRequestDTO } from './dto/request/register.request.dto';
import { ResetPasswordRequestDTO } from './dto/request/resetPassword.request.dto';
import { SendEmailVerfiyRequestDTO } from './dto/request/sendEmailVerify.request.dto';
import { VerifyAccountRequestDTO } from './dto/request/verifyAccount.request.dto';
import { LoginResponseDTO } from './dto/response/login.response.dto';
import { JwtAccessTokenGuard } from './guards/jwt-access/jwt-user-access-token.guard';
import { LocalUserAuthGuard } from './guards/local/local-user.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh/jwt-user-refresh-token.guard';
import { UserResponseDto } from '../user/dto/user.response.dto';

@Controller('auth')
// @UseInterceptors(new PrismaInterceptor(User))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly staffService: StaffService,
  ) {}

  @ApiPost({
    path: 'register',
    responseMessage:
      'User registered successfully. Please check your email to verify your account',
  })
  async register(@Body() dto: RegisterRequestDTO) {
    return await this.authService.register(dto);
  }

  @Get('google/login')
  async register(@Body() dto: RegisterRequestDTO) {
    return await this.authService.register(dto);
  }

  @Get('google/redirect')
  async register(@Body() dto: RegisterRequestDTO) {
    return await this.authService.register(dto);
  }

  @ApiPost({ path: 'login' })
  @UseGuards(LocalUserAuthGuard)
  @ApiBody({
    type: LoginRequestDTO,
    examples: {
      user_1: {
        value: {
          email: 'test1@gmail.com',
          password: '123',
        } as LoginRequestDTO,
      },
      user_2: {
        value: {
          email: 'michaelsmith@example.com',
          password: '1232@asdS',
        } as LoginRequestDTO,
      },
    },
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDTO,
  })
  async login(@Req() request: RequestWithUser) {
    const { user } = request;
    return await this.authService.login(user.id);
  }

  @UseGuards(JwtAccessTokenGuard)
  @ApiPost({ path: 'me' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@Req() request: RequestWithUser) {
    const { user } = request;
    return await this.userService.findByEmail(user.email);
  }

  @UseGuards(JwtRefreshTokenGuard)
  @ApiPost({ path: 'refresh-token' })
  @ApiBody({
    type: RefreshTokenRequestDTO,
  })
  async refreshAccessToken(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessToken = this.authService.generateAccessToken({
      userID: user.id,
    });
    return {
      accessToken,
    };
  }

  @ApiPost({ path: 'reset-password' })
  async resetPassword(@Body() dto: ResetPasswordRequestDTO) {
    return await this.authService.resetPassword(dto);
  }

  @ApiPost({ path: 'verify-account' })
  async verifyAccount(@Body() dto: VerifyAccountRequestDTO) {
    return await this.authService.verifyAccount(dto);
  }

  @ApiPost({ path: '/email/forgot-password' })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDTO) {
    return await this.authService.forgotPassword(dto.email);
  }

  @ApiPost({ path: '/email/verify-account' })
  async sendEmailVerify(@Body() dto: SendEmailVerfiyRequestDTO) {
    return await this.authService.sendVerificationEmail(dto.email);
  }
}
