import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DialogsService } from './dialogs.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { DialogPreviewDto } from './dto/dialog-preview.dto';
import { Dialog } from './entities/dialog.entity';

@ApiTags('Dialogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dialogs')
export class DialogsController {
  constructor(private readonly dialogsService: DialogsService) {}

  @Get('list')
  @ApiOperation({
    summary: 'Получить список диалогов текущего пользователя (id и title)',
  })
  @ApiOkResponse({
    description: 'Список диалогов с id и названиями',
    type: [DialogPreviewDto],
  })
  async getDialogList(@Request() req) {
    return this.dialogsService.getDialogList(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить диалог по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID диалога' })
  @ApiOkResponse({ description: 'Успешно найденный диалог', type: Dialog })
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.dialogsService.getDialogById(id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все диалоги пользователя' })
  @ApiOkResponse({
    description: 'Все доступные диалоги пользователя',
    type: [Dialog],
  })
  async getAll(@Request() req) {
    return this.dialogsService.getAllDialogs(req.user.id);
  }

  @Post('createDialog')
  @ApiOperation({ summary: 'Создать новый диалог' })
  @ApiCreatedResponse({ description: 'Диалог успешно создан', type: Dialog })
  async create(@Body() dto: CreateDialogDto, @Request() req) {
    return this.dialogsService.createDialog(req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить диалог по ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID диалога для удаления',
  })
  @ApiNoContentResponse({ description: 'Диалог успешно удалён' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.dialogsService.deleteDialog(id, req.user.id);
  }
}
