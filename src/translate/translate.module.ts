import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslateService } from './translate.service';
import { TranslateController } from './translate.controller';
import { Dialog } from '../dialogs/entities/dialog.entity';
import { ConfigModule } from '@nestjs/config';
import { Subscribe } from '../subscriptions/entities/subscribe.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Dialog, Subscribe]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [TranslateController],
  providers: [TranslateService],
})
export class TranslateModule {}
