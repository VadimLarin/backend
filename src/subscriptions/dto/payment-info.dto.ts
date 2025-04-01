// payment-info.dto.ts
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class PaymentInfoDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  code: string;

  //@IsString()
  //@IsNotEmpty()
  //paymentMethod: string;

  //@IsNumber()
  //@IsNotEmpty()
  //amount: number;

  //@IsString()
  //@IsNotEmpty()
  //transactionId: string;
}
