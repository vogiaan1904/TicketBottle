import { Gender } from '@prisma/client';
import { RegisterWithGoogleRequestDTO } from '../../dto/request/register.request.dto';

export const registerDto = {
  email: 'user@example.com',
  password: 'plainPassword',
  firstName: 'User',
  lastName: 'User',
  gender: Gender.CUSTOM,
  phoneNumber: '1234567890',
};

export const loginDto = {
  email: 'verifiedUser@example.com',
  password: 'validPassword',
};

export const loginWithGoogleDto: RegisterWithGoogleRequestDTO = {
  email: 'user@example.com',
  firstName: 'User',
  lastName: 'User',
};

export const createMockUser = (overrides = {}) => ({
  id: 'user-id',
  email: 'user@example.com',
  password: 'hashedPassword',
  isVerified: true,
  ...overrides,
});
