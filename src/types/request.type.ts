import { Staff, User } from '@prisma/client';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithStaff extends Request {
  user: Staff;
}
