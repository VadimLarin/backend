import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt, Min } from 'class-validator';

export class CreatePromocodeDto {
  @ApiProperty({
    description: 'Код промокода',
    example: 'DISCOUNT2025',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Продолжительность действия промокода в днях',
    example: 30,
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Дата истечения срока действия промокода',
    example: '2025-04-01T00:00:00.000Z',
  })
  @IsDateString()
  expiresAt: Date;
}
