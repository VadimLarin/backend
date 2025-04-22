import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { DeleteUserDto } from './dto/delete-user.dto';

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

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    await this.repository.update(userId, { refreshToken });
  }

  async findByEmail(email: string) {
    return this.repository.findOneBy({ email });
  }

  async findUserByEmail(email: string) {
    const user = await this.repository.findOneBy({ email });

    if (user && user.roleId !== 1) {
      return user;
    }

    throw new BadRequestException('Доступ запрещен');
  }

  async findById(id: number) {
    return this.repository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'roleId',
        'refreshToken',
        'createdAt',
        'updatedAt',
      ], // Исключаем передачу 'password'
    });
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

  async updateMe(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.repository.findOne({ where: { id: userId } });

    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }

    if (user.roleId === 1 && updateUserDto.roleId !== undefined) {
      throw new ForbiddenException('Изменение roleId запрещено для вашей роли');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);
    return this.repository.save(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async deleteUser(
    userId: number,
    currentUser: UserEntity,
    dto: DeleteUserDto,
  ): Promise<void> {
    const userToDelete = await this.repository.findOne({
      where: { id: userId },
    });

    if (!userToDelete) {
      throw new NotFoundException('Пользователь не найден');
    }

    const fullCurrentUser = await this.repository.findOne({
      where: { id: currentUser.id },
      select: ['id', 'password', 'roleId'],
    });

    if (!fullCurrentUser?.password) {
      throw new ForbiddenException('Пароль пользователя не найден');
    }

    // Проверка пароля текущего пользователя
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      fullCurrentUser.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Неверный пароль');
    }

    if (
      fullCurrentUser.roleId === 1 &&
      userToDelete.id !== fullCurrentUser.id
    ) {
      throw new ForbiddenException('Вы можете удалить только свой профиль');
    }

    if (
      fullCurrentUser.roleId !== 1 &&
      userToDelete.id === fullCurrentUser.id
    ) {
      throw new ForbiddenException('Администратор не может удалить себя');
    }

    await this.repository.remove(userToDelete);
  }
}
