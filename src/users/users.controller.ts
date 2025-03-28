import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Put,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserId } from '../decorators/user-id.decorator';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post('register')
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Get('getMe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'получить информацию о пользователе' })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findById(@UserId() id: number) {
    return this.usersService.findById(id);
  }

  @Get('findUserByEmail')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Найти пользователя по email(только для администратора)',
  })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByEmail(@Query('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Patch('updateMe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновить информацию о себе' })
  @ApiResponse({ status: 200, description: 'Информация успешно обновлена' })
  @ApiResponse({
    status: 404,
    description: 'Доступ запрещен или информация отсутствует',
  })
  async updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    return this.usersService.updateMe(userId, updateUserDto);
  }

  @Delete('deleteUser')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async deleteUser(@Req() req, @Body() dto: DeleteUserDto) {
    const currentUser = req.user;
    return this.usersService.deleteUser(dto.userId, currentUser, dto);
  }
}
