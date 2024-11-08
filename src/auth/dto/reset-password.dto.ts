// src/auth/dto/reset-password.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  email: string;

  @ApiProperty({
    description: 'Код подтверждения (Reset Code)',
    example: '123456',
  })
  @IsString({ message: 'Код подтверждения должен быть строкой' })
  @IsNotEmpty({ message: 'Код подтверждения не должен быть пустым' })
  code: string;

  @ApiProperty({
    description: 'Новый пароль пользователя',
    example: 'NewPassword456',
  })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль не должен быть пустым' })
  @MinLength(6, { message: 'Новый пароль должен быть не менее 6 символов' })
  newPassword: string;
}
