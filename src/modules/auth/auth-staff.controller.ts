import { Controller, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { ApiPost } from 'src/decorators/apiPost.decorator';
import { RequestWithStaff, RequestWithUser } from 'src/types/request.type';
import { StaffService } from '../staff/staff.service';
import { AuthService } from './auth.service';
import { LoginAsStaffRequestDto } from './dto/request/loginAsStaff.request.dto';
import { RefreshTokenRequestDTO } from './dto/request/refreshToken.request.dto';
import { LoginResponseDTO } from './dto/response/login.response.dto';
import { JwtStaffAccessTokenGuard } from './guards/jwt-access/jwt-staff-access-token.guard';
import { JwtStaffRefreshTokenGuard } from './guards/jwt-refresh/jwt-staff-refresh-token.guard';
import { LocalStaffAuthGuard } from './guards/local/local-staff.guard';
import { StaffResponseDto } from '../staff/dto/staff.response.dto';

@Controller('auth/staff')
// @UseInterceptors(new PrismaInterceptor(User))
export class AuthStaffController {
  constructor(
    private readonly authService: AuthService,
    private readonly staffService: StaffService,
  ) {}

  @UseGuards(LocalStaffAuthGuard)
  @ApiBody({
    type: LoginAsStaffRequestDto,
    examples: {
      user_1: {
        value: {
          username: 'admin',
          password: 'admin123',
        } as LoginAsStaffRequestDto,
      },
      user_2: {
        value: {
          username: 'michaelsmith',
          password: '1232@asdS',
        } as LoginAsStaffRequestDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDTO,
  })
  @ApiPost({ path: 'login' })
  async loginAsStaff(@Req() request: RequestWithStaff) {
    const { user } = request;
    return await this.authService.login(user.id);
  }

  @UseGuards(JwtStaffAccessTokenGuard)
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiPost({ path: 'me' })
  async getMeStaff(@Req() request: RequestWithStaff) {
    const { user } = request;
    return await this.staffService.findOne({ id: user.id });
  }

  @UseGuards(JwtStaffRefreshTokenGuard)
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
}
