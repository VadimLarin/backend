import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubsStatusDto {
  @ApiProperty({
    description: 'Название статуса подписки',
    example: 'Активная',
  })
  @IsString()
  title: string;
}
