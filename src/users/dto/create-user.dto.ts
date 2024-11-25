import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ default: 'Иван' })
  name: string;

  @ApiProperty({ default: 'ivanov@mail.com' })
  email: string;

  @ApiProperty({ default: '123' })
  password: string;
}
