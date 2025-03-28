import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль для подтверждения',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
