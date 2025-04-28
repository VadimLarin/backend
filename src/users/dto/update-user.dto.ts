import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiHideProperty, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Имя пользователя',
    example: 'ivan',
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  name?: string;

  @ApiPropertyOptional({
    description: 'Электронная почта',
    example: 'ivan@example.com',
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  email?: string;

  @ApiPropertyOptional({ description: 'Пароль', example: 'newpassword123' })
  @Transform(({ value }) => value === '' ? undefined : value)
  password?: string;

  @ApiHideProperty()
  roleId?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Аватар (изображение JPEG/PNG)',
  })
  avatar?: any;
}
