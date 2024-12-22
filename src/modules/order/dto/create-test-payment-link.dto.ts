import { GatewayName } from '@/modules/payment/enums/gatewayName';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTestPaymentLinkDto {
  @IsNumber()
  @Min(10000)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(GatewayName)
  gateway: GatewayName;
}
