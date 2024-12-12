import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '@prisma/client';

export const ROLES = 'roles';
export const StaffRoles = (...roles: [StaffRole, ...StaffRole[]]) =>
  SetMetadata(ROLES, roles);
