// для mvp данный функционал отключен и требует доработки в будущем
import { BadRequestException, Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { TermsEntity } from './entities/terms.entity';

@Injectable()
export class TermsService {
  constructor(
    @InjectRepository(TermsEntity)
    private repository: Repository<TermsEntity>,
  ) {}

  async create(dto: CreateTermsDto): Promise<TermsEntity> {
    return this.repository.save({
      eng: dto.eng,
      rus: dto.rus,
      context: dto.context,
    });
  }

  async findAll(): Promise<TermsEntity[]> {
    return this.repository.find();
  }

  async findOne(eng: string): Promise<TermsEntity> {
    return this.repository.findOneBy({ eng });
  }

  async update(id: number, dto: UpdateTermsDto) {
    const toUpdate = await this.repository.findOneBy({ id });
    if (!toUpdate) {
      throw new BadRequestException(`Записи с id=${id} не найдено`);
    }
    if (dto.eng) {
      toUpdate.eng = dto.eng;
    }
    if (dto.rus) {
      toUpdate.rus = dto.rus;
    }
    if (dto.context) {
      toUpdate.context = dto.context;
    }
    return this.repository.save(toUpdate);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.repository.delete(id);
  }
}
