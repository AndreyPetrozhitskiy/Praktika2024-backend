import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Логин или email пользователя',
    example: 'ivanivanov',
  })
  @IsString({ message: 'loginOrEmail должно быть строкой' })
  @IsNotEmpty({ message: 'loginOrEmail не должно быть пустым' })
  loginOrEmail: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'StrongP@ssw0rd',
  })
  @IsString({ message: 'password должно быть строкой' })
  @IsNotEmpty({ message: 'password не должно быть пустым' })
  password: string;
}
