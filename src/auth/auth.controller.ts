import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  BadRequestException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@mail.com' },
        password: { type: 'string', example: '123123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Авторизация успешна, возвращает JWT токен',
  })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль' })
  async login(@Request() req) {
    return this.authService.login(req.user as UserEntity);
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан, возвращает JWT токен',
  })
  @ApiResponse({ status: 400, description: 'Email и пароль обязательны' })
  async register(@Body() dto: CreateUserDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email и пароль обязательны');
    }
    return this.authService.register(dto);
  }

  @Post('requestPasswordReset')
  @ApiOperation({ summary: 'Запрос на восстановление пароля' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Инструкции отправлены на email' })
  @ApiResponse({ status: 400, description: 'Пользователь не найден' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('resetPassword')
  @ApiOperation({ summary: 'Сброс пароля' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        token: { type: 'string', example: '123456' },
        newPassword: { type: 'string', example: 'NewStrongPassword123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
  @ApiResponse({ status: 400, description: 'Неверный токен или email' })
  async resetPassword(
    @Body() body: { email: string; token: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      body.email,
      body.token,
      body.newPassword,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление access токена' })
  @ApiBody({ schema: { example: { refreshToken: 'your_refresh_token' } } })
  @ApiResponse({ status: 200, description: 'Новый access токен' })
  @ApiResponse({
    status: 401,
    description: 'Неверный или просроченный refresh токен',
  })
  async refreshAccessToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh токен отсутствует');
    }

    return this.authService.refreshAccessToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('revoke')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Аннулирование refresh токена' })
  @ApiResponse({
    status: 200,
    description: 'Токен успешно аннулирован',
    schema: {
      example: {
        message: 'Refresh токен аннулирован',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async revokeToken(@Req() req) {
    const userId = req.user.id;
    return await this.authService.revokeRefreshToken(userId);
  }
}
