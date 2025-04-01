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
import { TokenExpiredError } from 'jsonwebtoken';

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

  async compareRefreshTokens(
    plainToken: string,
    hashedToken: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainToken, hashedToken);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(refreshToken, saltOrRounds);
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

      const payload = { id: userData.id };
      const expiresIn = parseInt(this.configService.get('JWT_EXPIRES_IN'), 10);
      const refreshExpiresIn = parseInt(
        this.configService.get('JWT_REFRESH_EXPIRES_IN'),
        10,
      );

      const accessToken = this.jwtService.sign(payload, { expiresIn });
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: refreshExpiresIn,
      });
      const hashedRefreshToken = await this.hashRefreshToken(refreshToken);

      await this.usersService.updateRefreshToken(
        userData.id,
        hashedRefreshToken,
      );

      return { accessToken, refreshToken };
    } catch (err) {
      throw new ForbiddenException(err.message);
    }
  }

  async login(user: UserEntity) {
    const payload = { id: user.id };
    const expiresIn = parseInt(this.configService.get('JWT_EXPIRES_IN'), 10);
    const refreshExpiresIn = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      10,
    );

    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpiresIn,
    });
    const hashedRefreshToken = await this.hashRefreshToken(refreshToken);

    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: false,
      });
      const user = await this.usersService.findById(payload.id);
      if (!user) throw new UnauthorizedException('Пользователь не найден');

      if (user.refreshToken === 'revoked') {
        throw new UnauthorizedException('Refresh токен был аннулирован'); //нужно сделать нормальный вывод ошибки
      }

      const isMatch = await this.compareRefreshTokens(
        refreshToken,
        user.refreshToken,
      );
      if (!isMatch)
        throw new UnauthorizedException(
          'Неверный или просроченный refresh токен',
        );

      const expiresIn = parseInt(this.configService.get('JWT_EXPIRES_IN'), 10);
      const newAccessToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Ошибка обновления токена');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new BadRequestException('Пользователь с таким email не найден');

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
    if (!user)
      throw new BadRequestException('Пользователь с таким email не найден');

    const resetEntry = await this.resetPasswordRepository.findOne({
      where: { userId: user.id, code },
      order: { createdAt: 'DESC' },
    });
    if (!resetEntry)
      throw new BadRequestException('Неверный или устаревший код');

    await this.usersService.updatePassword(email, newPassword);
    await this.resetPasswordRepository.delete(resetEntry.id);

    return { message: 'Пароль успешно изменен' };
  }

  async revokeRefreshToken(userId: number) {
    await this.usersService.updateRefreshToken(userId, 'revoked');
    return { message: 'Refresh токен аннулирован' };
  }
}
