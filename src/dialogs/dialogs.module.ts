import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { DialogsService } from './dialogs.service';
import { DialogsController } from './dialogs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dialog])],
  providers: [DialogsService],
  controllers: [DialogsController],
})
export class DialogsModule {}
