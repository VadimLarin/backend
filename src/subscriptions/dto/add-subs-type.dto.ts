import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CreateSubsTypeDto {
  @ApiProperty({
    description: 'Название типа подписки',
    example: 'Базовый план',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Стоимость подписки',
    example: 299,
  })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Продолжительность подписки в месяцах',
    example: 1,
  })
  @IsInt()
  @Min(1)
  duration: number;
}
