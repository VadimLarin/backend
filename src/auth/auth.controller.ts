import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CreateUserDto })
  async login(@Request() req) {
    return this.authService.login(req.user as UserEntity);
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email и пароль обязательны');
    }
    return this.authService.register(dto);
  }
}
