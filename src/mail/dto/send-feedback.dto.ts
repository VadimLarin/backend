import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class SendFeedbackDto {
  @ApiProperty({
    example: 'Очень классный сервис!',
    description: 'Текст сообщения',
  })
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
