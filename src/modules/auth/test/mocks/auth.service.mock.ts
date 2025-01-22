// src/modules/auth/test/mocks/auth.service.mock.ts

export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockToken'),
  decode: jest.fn(),
};

export const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'JWT_ACCESS_TOKEN_EXPIRATION_TIME':
        return '3600';
      case 'JWT_REFRESH_TOKEN_EXPIRATION_TIME':
        return '604800000';
      case 'FORGOT_PASSWORD_EXPIRATION_TIME':
        return '15mins';
      case 'VERIFY_ACCOUNT_EXPIRATION_TIME':
        return '15mins';
    }
  }),
};

export const mockEmailService = {
  sendUserVerifyEmail: jest.fn(),
  sendUserResetPasswordEmail: jest.fn(),
  // Add other email methods as needed
};

export const mockTokenService = {
  signJwtWithSecret: jest.fn().mockReturnValue('mockToken'),
  verifyJwtWithSecret: jest.fn(),
};

export const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};
