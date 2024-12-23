import { GatewayName } from '@/modules/payment/enums/gatewayName';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateTestPaymentLinkDto {
  @IsNumber()
  @Min(10000)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(GatewayName)
  gateway: GatewayName;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ example: 'https://www.google.com/' })
  returnUrl: string;
}
