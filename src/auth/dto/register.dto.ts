// src/auth/dto/register.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
  })
  @IsString({ message: 'name должно быть строкой' })
  @IsNotEmpty({ message: 'name не должно быть пустым' })
  name: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'ivan@example.com',
  })
  @IsEmail({}, { message: 'Некорректный email адрес' })
  @IsNotEmpty({ message: 'email не должно быть пустым' })
  email: string;

  @ApiProperty({
    description: 'Логин пользователя',
    example: 'ivanivanov',
  })
  @IsString({ message: 'login должно быть строкой' })
  @IsNotEmpty({ message: 'login не должно быть пустым' })
  login: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'StrongP@ssw0rd',
    minLength: 6,
  })
  @IsString({ message: 'password должно быть строкой' })
  @MinLength(6, { message: 'password должно содержать минимум 6 символов' })
  @IsNotEmpty({ message: 'password не должно быть пустым' })
  password: string;
}
