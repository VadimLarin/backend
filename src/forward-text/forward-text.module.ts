import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ForwardTextService } from './forward-text.service';
import { ForwardTextController } from './forward-text.controller';

@Module({
  imports: [HttpModule], // Подключаем HttpModule для отправки запросов
  controllers: [ForwardTextController],
  providers: [ForwardTextService],
})
export class ForwardTextModule {}
