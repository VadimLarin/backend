import { IsOptional, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { SubsStatus } from '../entities/subs-status.entity';
import { SubsTypes } from '../entities/subs-type.entity';

export class UpdateSubscribeDto {
  @IsOptional()
  @IsEnum(SubsTypes)
  type?: number;

  @IsOptional()
  @IsEnum(SubsStatus)
  status?: number;

  @IsOptional()
  @IsNotEmpty()
  startedAt?: Date;

  @IsOptional()
  @IsNotEmpty()
  expiresAt?: Date;
}
