import { ApiProperty } from '@nestjs/swagger';

export class DialogPreviewDto {
  @ApiProperty({ example: 1, description: 'ID диалога' })
  id: number;

  @ApiProperty({
    example: 'Перевод IT-текста',
    description: 'Название диалога',
  })
  title: string;
}
