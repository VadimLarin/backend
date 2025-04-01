import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubsStatus } from '../entities/subs-status.entity';
import { SubsTypes } from '../entities/subs-type.entity';

export class CreateSubscribeDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsOptional()
  code?: string; // Добавлено поле для промокода

  @IsEnum(SubsTypes)
  @IsNotEmpty()
  type: number;

  @IsEnum(SubsStatus)
  @IsNotEmpty()
  status: number;

  @IsNotEmpty()
  startedAt: Date;

  @IsNotEmpty()
  expiresAt: Date;
}
