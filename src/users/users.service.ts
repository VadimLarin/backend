import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { DeleteUserDto } from './dto/delete-user.dto';
import { SharpPipe } from './pipes/sharp.pipe';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  private avatarRequestTimestamps: Map<number, number> = new Map();

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

  async findById(id: number, withAvatar: boolean = false): Promise<UserEntity> {
    const now = Date.now();

    if (withAvatar) {
      const lastRequest = this.avatarRequestTimestamps.get(id) || 0;
      if (now - lastRequest < 1000) {
        throw new HttpException(
          'Фото можно запрашивать не чаще одного раза в секунду',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      this.avatarRequestTimestamps.set(id, now);
    }

    const selectFields: (keyof UserEntity)[] = [
      'id',
      'name',
      'email',
      'refreshToken',
      'roleId',
      'createdAt',
      'updatedAt',
      ...(withAvatar ? (['avatar'] as (keyof UserEntity)[]) : []),
    ];

    const user = await this.repository.findOne({
      where: { id },
      select: selectFields,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
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
    avatarFile?: Express.Multer.File,
  ): Promise<UserEntity> {
    const user = await this.repository.findOne({ where: { id: userId } });
  
    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }
  
    if (user.roleId === 1 && updateUserDto.roleId !== undefined) {
      throw new ForbiddenException('Изменение roleId запрещено для вашей роли');
    }
  
    for (const key of Object.keys(updateUserDto)) {
      if (updateUserDto[key] === '') {
        delete updateUserDto[key];
      }
    }
  
    const hasAvatar = avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0;
    const hasDataToUpdate = Object.keys(updateUserDto).length > 0 || hasAvatar;
  
    if (!hasDataToUpdate) {
      throw new BadRequestException('Нет данных для обновления');
    }
  
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
  
    if (hasAvatar) {
      const sharpPipe = new SharpPipe();
      try {
        const processedAvatar = await sharpPipe.transform(avatarFile);
        user.avatar = processedAvatar;
      } catch (error) {
        throw new BadRequestException('Ошибка обработки изображения: ' + error.message);
      }
    }
  
    Object.assign(user, updateUserDto);
    const updatedUser = await this.repository.save(user);
  
    const { password, refreshToken, avatar, ...userWithoutSensitive } = updatedUser;
    return userWithoutSensitive as UserEntity;
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
