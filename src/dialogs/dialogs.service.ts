import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dialog } from './entities/dialog.entity';
import { CreateDialogDto } from './dto/create-dialog.dto';

@Injectable()
export class DialogsService {
  constructor(
    @InjectRepository(Dialog)
    private dialogRepository: Repository<Dialog>,
  ) {}

  async getDialogById(
    dialogId: number,
    userId: number,
    roleId: number,
  ): Promise<Dialog> {
    const dialog = await this.dialogRepository.findOneBy({ id: dialogId });
    if (!dialog) throw new NotFoundException('Диалог не найден');

    if (roleId !== 2 && dialog.userId !== userId) {
      throw new ForbiddenException('Нет доступа к данному диалогу');
    }

    return dialog;
  }

  async getAllDialogs(userId: number, roleId: number): Promise<Dialog[]> {
    if (roleId !== 2) {
      return this.dialogRepository.find({ where: { userId } });
    }
    return this.dialogRepository.find();
  }

  async createDialog(
    userId: number,
    dto: CreateDialogDto,
  ): Promise<Dialog> {
    const dialog = this.dialogRepository.create({ ...dto, userId });
    return this.dialogRepository.save(dialog);
  }

  async deleteDialog(
    dialogId: number,
    userId: number,
    roleId: number,
  ): Promise<void> {
    const dialog = await this.dialogRepository.findOneBy({ id: dialogId });
    if (!dialog) throw new NotFoundException('Диалог не найден');

    if (roleId !== 2 && dialog.userId !== userId) {
      throw new ForbiddenException('Удаление чужих диалогов запрещено');
    }

    await this.dialogRepository.delete({ id: dialogId });
  }

  async getDialogList(
    userId: number,
    roleId: number,
  ): Promise<{ id: number; title: string }[]> {
    if (roleId !== 2) {
      return this.dialogRepository.find({
        where: { userId },
        select: ['id', 'title'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.dialogRepository.find({
      select: ['id', 'title'],
      order: { createdAt: 'DESC' },
    });
  }
}
