import { Gender } from '@prisma/client';
import { Order } from '../../order/entities/order.entity';
import { Expose } from 'class-transformer';

export class User {
  @Expose()
  id: string;
  @Expose()
  email: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  gender: Gender;
  @Expose()
  phoneNumber: string | null;
  @Expose()
  orders?: Order[];
  @Expose()
  isVerified: boolean;
}
