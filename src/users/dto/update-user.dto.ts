import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Имя пользователя',
    example: 'ivan',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Электронная почта',
    example: 'ivan@example.com',
  })
  email?: string;

  @ApiPropertyOptional({ description: 'Пароль', example: 'newpassword123' })
  password?: string;

  @ApiHideProperty()
  roleId?: number;
}
