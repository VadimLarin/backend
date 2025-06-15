import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { DialogsService } from './dialogs.service';
import { DialogsController } from './dialogs.controller';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Dialog])],
  providers: [DialogsService, UsersService],
  controllers: [DialogsController],
})
export class DialogsModule {}
