import { ApiProperty } from '@nestjs/swagger';

export class CreateDialogDto {
  @ApiProperty({ example: 'Перевод финансового текста' })
  title: string;

  @ApiProperty({
    example: [
      { role: 'user', text: 'Привет' },
      { role: 'assistant', text: 'Привет! Чем могу помочь?' },
    ],
  })
  dialog: any;
}
