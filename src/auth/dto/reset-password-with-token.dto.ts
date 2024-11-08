// src/auth/dto/reset-password-with-token.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordWithTokenDto {
  @ApiProperty({
    description: 'Токен для сброса пароля',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Токен должен быть строкой' })
  @IsNotEmpty({ message: 'Токен не должен быть пустым' })
  token: string;

  @ApiProperty({
    description: 'Новый пароль пользователя',
    example: 'NewPassword456',
  })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль не должен быть пустым' })
  @MinLength(6, { message: 'Новый пароль должен быть не менее 6 символов' })
  newPassword: string;
}
