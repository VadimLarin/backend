import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TranslateService } from './translate.service';
import { GenerateTextDto } from './dto/translate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Translate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Перевести текст через YandexGPT и записать в диалог',
  })
  @ApiOkResponse({
    description: 'Ответ от YandexGPT и ID диалога',
    schema: {
      example: {
        response: 'Hello, how are you?',
        dialogId: 7,
      },
    },
  })
  async generate(@Body() dto: GenerateTextDto, @Request() req) {
    const { prompt, dialogId, title } = dto;
    return this.translateService.translateAndSave(
      prompt,
      req.user.id,
      dialogId,
      title,
    );
  }
}
