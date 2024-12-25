import { JwtStaffAccessTokenGuard } from '@/modules/auth/guards/jwt-access/jwt-staff-access-token.guard';
import { StaffRolesGuard } from '@/modules/auth/guards/staff-role/staff-roles.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { StaffRole } from '@prisma/client';
import { StaffRoles } from './staff-roles.decorator';

export function RequireStaffRole() {
  return applyDecorators(
    StaffRoles(StaffRole.STAFF, StaffRole.ADMIN),
    UseGuards(StaffRolesGuard),
    UseGuards(JwtStaffAccessTokenGuard),
  );
}
export function OnlyAdmin() {
  return applyDecorators(
    StaffRoles(StaffRole.ADMIN),
    UseGuards(JwtStaffAccessTokenGuard),
    UseGuards(StaffRolesGuard),
  );
}
