// для mvp данный модуль отключен и требует доработки в будущем
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { TermsService } from './terms.service';
import { TermsController } from './terms.controller';
import { TermsEntity } from './entities/terms.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([TermsEntity]), JwtModule],
  controllers: [TermsController],
  providers: [TermsService],
})
export class TermsModule {}
