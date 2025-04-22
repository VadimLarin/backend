import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateTextDto {
  @ApiProperty({
    description: 'Текст запроса к YandexGPT',
    example: 'Переведи на английский: Привет, как дела?',
  })
  prompt: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'ID диалога, если продолжаем беседу',
  })
  dialogId?: number;

  @ApiPropertyOptional({
    example: 'Перевод IT статьи',
    description: 'Название диалога (если новый)',
  })
  title?: string;
}
