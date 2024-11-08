// src/auth/dto/change-password.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Старый пароль пользователя',
    example: 'OldPassword123',
  })
  @IsString({ message: 'Старый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Старый пароль не должен быть пустым' })
  oldPassword: string;

  @ApiProperty({
    description: 'Новый пароль пользователя',
    example: 'NewPassword456',
  })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль не должен быть пустым' })
  @MinLength(6, { message: 'Новый пароль должен быть не менее 6 символов' })
  newPassword: string;
}
