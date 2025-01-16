import { EmailService } from '@/modules/email/email.service';
import { StaffService } from '@/modules/staff/staff.service';
import { mockStaffService } from '@/modules/staff/test/mocks/staff.service.mock';
import { TokenService } from '@/modules/token/token.service';
import { mockUserService } from '@/modules/user/test/mocks/user.service.mock';
import { UserService } from '@/modules/user/user.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Cache } from 'cache-manager';
import { AuthService } from '../auth.service';
import { ResetPasswordTokenPayload } from '../interfaces/token.interface';
import {
  mockCacheService,
  mockConfigService,
  mockEmailService,
  mockJwtService,
  mockTokenService,
} from './mocks/auth.service.mock';
import {
  createMockUser,
  loginDto,
  loginWithGoogleDto,
  registerDto,
} from './mocks/data.mock';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;
  let tokenService: TokenService;
  let staffService: StaffService;
  let cacheService: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: StaffService,
          useValue: mockStaffService,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    tokenService = module.get<TokenService>(TokenService);
    staffService = module.get<StaffService>(StaffService);
    cacheService = module.get<Cache>('CACHE_MANAGER');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register successfully and return a user data', async () => {
      // Arrange
      const unVerifiedUser = createMockUser({ isVerified: false });
      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createMockUser(unVerifiedUser));

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(async () => 'hashedPassword');

      jest.spyOn(userService, 'create').mockResolvedValueOnce(unVerifiedUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual(unVerifiedUser);
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
      });

      jest.clearAllMocks();
    });

    it('should throw an error if the email already exists', async () => {
      // Arrange
      const unVerifiedUser = createMockUser({ isVerified: false });
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(unVerifiedUser);

      // Act
      const result = service.register(registerDto);

      // Assert
      await expect(result).rejects.toThrow(
        new BadRequestException('Email already exists'),
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
    });
  });

  describe('login', () => {
    it('should generate access and refresh tokens successfully', async () => {
      // Arrange
      const userId = 'valid-user-id';

      jest.spyOn(service, 'generateAccessToken').mockReturnValue('accessToken');

      jest
        .spyOn(service, 'generateRefreshToken')
        .mockReturnValue('refreshToken');

      jest.spyOn(service, 'storeRefreshToken');

      // Act
      const tokens = await service.login(userId);

      // Assert
      expect(tokens).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      expect(service.generateAccessToken).toHaveBeenCalledWith({
        userID: userId,
      });

      expect(service.generateRefreshToken).toHaveBeenCalledWith({
        userID: userId,
      });

      expect(service.storeRefreshToken).toHaveBeenCalledWith(
        userId,
        'refreshToken',
      );
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return user data when credentials are valid and account is verified', async () => {
      // Arrange
      const verifiedUser = createMockUser();
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(verifiedUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      // Act
      const result = await service.getAuthenticatedUser(
        loginDto.email,
        loginDto.password,
      );

      // Assert
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        verifiedUser.password,
      );
      expect(result).toEqual(verifiedUser);
      jest.clearAllMocks();
    });

    it('should throw BadRequestException if user does not exist', async () => {
      // Arrange
      const loginDto = {
        email: 'nonExistUser@example.com',
        password: 'validPassword',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getAuthenticatedUser(loginDto.email, loginDto.password),
      ).rejects.toThrow(new BadRequestException('User not found'));

      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw BadRequestException if user is not verified', async () => {
      // Arrange
      const unVerifiedUser = createMockUser({ isVerified: false });

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(unVerifiedUser);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      // Act
      await expect(
        service.getAuthenticatedUser(loginDto.email, loginDto.password),
      ).rejects.toThrow(new BadRequestException('User not verified'));

      // Assert
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      const user = createMockUser();
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      // Act & Assert
      await expect(
        service.getAuthenticatedUser(loginDto.email, loginDto.password),
      ).rejects.toThrow(
        new UnauthorizedException("Email or password doesn't match"),
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send an email to the user with a reset password token', async () => {
      // Arrange
      const email = 'user@example.com';
      const user = createMockUser();
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      jest
        .spyOn(tokenService, 'signJwtWithSecret')
        .mockReturnValue('mockToken');

      jest.spyOn(emailService, 'sendUserResetPasswordEmail');

      const payload: ResetPasswordTokenPayload = {
        email,
      };
      // Act
      await service.forgotPassword(email);

      // Assert
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(tokenService.signJwtWithSecret).toHaveBeenCalledWith({
        payload,
        secret: user.password,
        exp: mockConfigService.get('FORGOT_PASSWORD_EXPIRATION_TIME'),
      });
    });
  });

  describe('resetPassword', () => {
    // Arrange
    it('should reset the user password successfully', async () => {
      // Arrange
      const user = createMockUser();
      const updatedUser = { ...user, password: 'hashedPassword' };
      const newPassword = 'newPassword';
      const resetPasswordToken = 'mockToken';

      jest.spyOn(jwtService, 'decode').mockReturnValue({ email: user.email });
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      jest
        .spyOn(tokenService, 'verifyJwtWithSecret')
        .mockImplementation(async () => true);
      jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashedPassword');

      // Act
      await service.resetPassword({ token: resetPasswordToken, newPassword });

      // Assert
      expect(jwtService.decode).toHaveBeenCalledWith(resetPasswordToken);
      expect(userService.findByEmail).toHaveBeenCalledWith(user.email);
      expect(tokenService.verifyJwtWithSecret).toHaveBeenCalledWith(
        resetPasswordToken,
        user.password,
      );
      expect(userService.update).toHaveBeenCalledWith(
        { id: user.id },
        { password: 'hashedPassword' },
      );
    });

    it('should throw BadRequestException the token is invalid', async () => {
      // Arrange
      const newPassword = 'newPassword';
      const resetPasswordToken = 'mockToken';
      jest
        .spyOn(tokenService, 'verifyJwtWithSecret')
        .mockImplementation(async () => false);

      // Act & Assert
      await expect(
        service.resetPassword({ token: resetPasswordToken, newPassword }),
      ).rejects.toThrow(new BadRequestException('Invalid token'));
    });

    it('should throw BadRequestException user does not exist', async () => {
      // Arrange
      const newPassword = 'newPassword';
      const resetPasswordToken = 'mockToken';
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.resetPassword({ token: resetPasswordToken, newPassword }),
      ).rejects.toThrow(new BadRequestException('User not found'));
    });
  });

  describe('verifyAccount', () => {
    it('should verify the user account successfully', async () => {
      // Arrange
      const user = createMockUser({ isVerified: false });
      const updatedUser = { ...user, isVerified: true };
      const token = 'mockToken';

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      jest
        .spyOn(tokenService, 'verifyJwtWithSecret')
        .mockImplementation(async () => true);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ email: user.email });
      jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);

      // Act
      await service.verifyAccount({ token });

      // Assert
      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(userService.findByEmail).toHaveBeenCalledWith(user.email);
      expect(tokenService.verifyJwtWithSecret).toHaveBeenCalledWith(
        token,
        user.password + user.isVerified,
      );
      expect(userService.update).toHaveBeenCalledWith(
        { id: user.id },
        { isVerified: true },
      );
    });

    it('should throw BadRequestException if user is already verified', async () => {
      // Arrange
      const user = createMockUser({ isVerified: true });

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      jest
        .spyOn(tokenService, 'verifyJwtWithSecret')
        .mockImplementation(async () => true);

      // Act
      await expect(
        service.verifyAccount({ token: 'mockToken' }),
      ).rejects.toThrow(new BadRequestException('Account already verified'));
    });
    it('should throw BadRequestException if token is invalid', async () => {
      // Arrange
      const user = createMockUser({ isVerified: false });

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      jest
        .spyOn(tokenService, 'verifyJwtWithSecret')
        .mockImplementation(async () => false);

      // Act
      await expect(
        service.verifyAccount({ token: 'mockToken' }),
      ).rejects.toThrow(new BadRequestException('Invalid token'));
    });
  });

  describe('validateGoogleLogin', () => {
    it('should return user data if user exists', async () => {
      // Arrange

      const user = createMockUser();
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      // Act
      const result = await service.validateGoogleLogin(loginWithGoogleDto);

      // Assert
      expect(result).toEqual(user);
      expect(userService.findByEmail).toHaveBeenCalledWith(
        loginWithGoogleDto.email,
      );
    });

    it('should create new user if user does not exist', async () => {
      // Arrange
      const newUser = createMockUser();

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(newUser);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashedPassword');

      // Act
      const result = await service.validateGoogleLogin(loginWithGoogleDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(userService.findByEmail).toHaveBeenCalledWith(
        loginWithGoogleDto.email,
      );
      expect(userService.create).toHaveBeenCalledWith({
        email: loginWithGoogleDto.email,
        firstName: loginWithGoogleDto.firstName,
        lastName: loginWithGoogleDto.lastName,
        password: 'hashedPassword',
        isVerified: true,
      });
    });
  });
});
