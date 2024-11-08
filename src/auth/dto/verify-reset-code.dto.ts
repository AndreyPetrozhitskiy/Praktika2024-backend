// src/auth/dto/verify-reset-code.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetCodeDto {
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
}
