import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ default: 'Иван' })
  @IsString()
  @Matches(/^[a-zA-Zа-яА-Я0-9 _-]+$/, {
    message: 'Имя содержит недопустимые символы',
  })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(35, { message: 'Имя не должно превышать 35 символов' })
  name: string;

  @ApiProperty({ default: 'ivanov@mail.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ default: '123' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}
