import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSubsTypeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  duration: number; // Длительность подписки в днях
}
