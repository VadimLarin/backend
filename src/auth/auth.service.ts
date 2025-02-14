import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { code: string; expiresAt: number }>();
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Неверные учетные данные');
  }

  async register(dto: CreateUserDto) {
    const isCreateUsers = this.configService.get('CREATE_USERS') === 'true';
    if (!isCreateUsers) {
      throw new BadRequestException('Запрещено создавать новых пользователей');
    }

    try {
      const hashedPassword = await this.hashPassword(dto.password);
      const userData = await this.usersService.create({
        ...dto,
        password: hashedPassword,
      });

      return {
        token: this.jwtService.sign({ id: userData.id }),
      };
    } catch (err) {
      throw new ForbiddenException(err.message);
    }
  }

  async login(user: UserEntity) {
    return {
      token: this.jwtService.sign({ id: user.id }),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Пользователь с таким email не найден');
    }

    // Генерация 6-значного кода
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 минут

    // Сохраняем код и время истечения
    this.resetTokens.set(email, { code: resetCode, expiresAt });

    // Отправляем email с кодом
    await this.mailService.sendMail(
      email,
      'Сброс пароля',
      `Ваш код для сброса пароля: ${resetCode}. Он действителен в течение 30 минут.`,
    );

    return { message: 'Код отправлен на ваш email' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const tokenData = this.resetTokens.get(email);

    if (!tokenData || tokenData.code !== code) {
      throw new BadRequestException('Неверный или устаревший код');
    }

    if (Date.now() > tokenData.expiresAt) {
      this.resetTokens.delete(email);
      throw new BadRequestException('Код истек. Запросите новый.');
    }

    // Обновляем пароль пользователя
    await this.usersService.updatePassword(email, newPassword);

    // Удаляем использованный код
    this.resetTokens.delete(email);

    return { message: 'Пароль успешно изменен' };
  }
}
