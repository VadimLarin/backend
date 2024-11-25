import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TermsService } from './terms.service';
import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { TermsEntity } from './entities/terms.entity';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('terms')
@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Post('new')
  async create(@Body() dto: CreateTermsDto): Promise<TermsEntity> {
    return this.termsService.create(dto);
  }

  @Get('all')
  findAll() {
    return this.termsService.findAll();
  }

  @Get(':id')
  findOne(@Param('eng') eng: string): Promise<TermsEntity> {
    return this.termsService.findOne(eng); // НЕ УВЕРЕН ЧТО ТУТ ДОЛЖЕН БЫТЬ ПРОСТО ENG, ИСПРАВИТЬ ЗДЕСЬ ЕСЛИ НЕ РАБОТАЕТ ДОЛЖНЫМ ОБРАЗОМ
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTermsDto,
  ): Promise<TermsEntity> {
    return this.termsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteResult> {
    return this.termsService.delete(+id);
  }
}
