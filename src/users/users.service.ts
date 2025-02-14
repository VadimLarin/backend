import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException(`Пользователь ${dto.email} уже существует`);
    }

    return this.repository.save(dto);
  }

  async findByEmail(email: string) {
    return this.repository.findOneBy({ email });
  }

  async findById(id: number) {
    return this.repository.findOneBy({ id });
  }

  async updatePassword(email: string, newPassword: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.repository.update(user.id, { password: hashedPassword });

    return { message: 'Пароль успешно обновлен' };
  }
}
