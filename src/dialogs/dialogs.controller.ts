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
import { UsersService } from '../users/users.service';

@ApiTags('Dialogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dialogs')
export class DialogsController {
  constructor(
    private readonly dialogsService: DialogsService,
    private readonly usersService: UsersService,
  ) {}

  private async getUserRoleId(userId: number): Promise<number> {
    const user = await this.usersService.findById(userId);
    return user.roleId;
  }

  @Get('list')
  @ApiOperation({
    summary: 'Получить список диалогов текущего пользователя (id и title)',
  })
  @ApiOkResponse({
    description: 'Список диалогов с id и названиями',
    type: [DialogPreviewDto],
  })
  async getDialogList(@Request() req) {
    const roleId = await this.getUserRoleId(req.user.id);
    return this.dialogsService.getDialogList(req.user.id, roleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить диалог по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID диалога' })
  @ApiOkResponse({ description: 'Успешно найденный диалог', type: Dialog })
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const roleId = await this.getUserRoleId(req.user.id);
    return this.dialogsService.getDialogById(id, req.user.id, roleId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все диалоги пользователя' })
  @ApiOkResponse({
    description: 'Все доступные диалоги пользователя',
    type: [Dialog],
  })
  async getAll(@Request() req) {
    const roleId = await this.getUserRoleId(req.user.id);
    return this.dialogsService.getAllDialogs(req.user.id, roleId);
  }

  @Post('createDialog')
  @ApiOperation({ summary: 'Создать новый диалог' })
  @ApiCreatedResponse({ description: 'Диалог успешно создан', type: Dialog })
  async create(@Body() dto: CreateDialogDto, @Request() req) {
    const roleId = await this.getUserRoleId(req.user.id);
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
    const roleId = await this.getUserRoleId(req.user.id);
    return this.dialogsService.deleteDialog(id, req.user.id, roleId);
  }
}