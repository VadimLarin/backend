import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ForwardTextService } from './forward-text.service';

@Controller('forward-text')
@ApiTags('Forward Text') // Тег для Swagger
export class ForwardTextController {
  constructor(private readonly forwardTextService: ForwardTextService) {}

  @Post()
  @ApiBody({
    description: 'Текст, который нужно отправить',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ответ от целевого сервера',
    schema: {
      type: 'object', // Указываем, что возвращается JSON
      additionalProperties: true,
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 500, description: 'Ошибка сервера' })
  async forwardText(@Body('text') text: string): Promise<any> {
    return await this.forwardTextService.forwardText(text); // Возвращаем JSON напрямую
  }
}
