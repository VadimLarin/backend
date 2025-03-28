import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { authEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @InjectRepository(authEntity)
    private resetPasswordRepository: Repository<authEntity>,
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

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Пользователь с таким email не найден');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.resetPasswordRepository.save({
      userId: user.id,
      code: resetCode,
    });

    await this.mailService.sendMail(
      email,
      'Сброс пароля',
      `Ваш код для сброса пароля: ${resetCode}. Он действителен в течение 30 минут.`,
    );

    return { message: 'Код отправлен на ваш email' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Пользователь с таким email не найден');
    }

    const resetEntry = await this.resetPasswordRepository.findOne({
      where: { userId: user.id, code },
      order: { createdAt: 'DESC' },
    });

    if (!resetEntry) {
      throw new BadRequestException('Неверный или устаревший код');
    }

    const expirationTime =
      new Date(resetEntry.createdAt).getTime() + 30 * 60 * 1000;
    if (Date.now() > expirationTime) {
      await this.resetPasswordRepository.delete(resetEntry.id);
      throw new BadRequestException('Код истек. Запросите новый.');
    }

    await this.usersService.updatePassword(email, newPassword);
    await this.resetPasswordRepository.delete(resetEntry.id);

    return { message: 'Пароль успешно изменен' };
  }
}
