import {
  Controller,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';


import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserId } from '../decorators/user-id.decorator';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('getMe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'получить информацию о пользователе' })
  @ApiQuery({ name: 'withAvatar', required: false, type: Boolean, description: 'Получить аватар' })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findById(
    @UserId() id: number,
    @Res() res: Response,
    @Query('withAvatar') withAvatar?: boolean | string,
  ) 
  {
    const includeAvatar = String(withAvatar) === 'true';
    const user = await this.usersService.findById(id, includeAvatar);

    const { avatar, refreshToken, ...userWithoutSensitiveData } = user;

    if (includeAvatar && avatar) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(avatar);
    } else {
    res.json(userWithoutSensitiveData);
    }
  }

  @Get('findUserByEmail')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Найти пользователя по email (только для администратора)',
  })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByEmail(@Query('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Patch('updateMe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Обновить информацию о себе (можно добавить аватар)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Информация успешно обновлена' })
  @ApiResponse({ status: 404, description: 'Доступ запрещен или информация отсутствует' })
  async updateMe(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateMe(userId, updateUserDto, avatar);
  
    const { password, refreshToken, avatar: _avatar, ...safeUser } = updatedUser;
    return safeUser;
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
