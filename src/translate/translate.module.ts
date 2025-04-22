import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslateService } from './translate.service';
import { TranslateController } from './translate.controller';
import { Dialog } from '../dialogs/entities/dialog.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Dialog]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [TranslateController],
  providers: [TranslateService],
})
export class TranslateModule {}
