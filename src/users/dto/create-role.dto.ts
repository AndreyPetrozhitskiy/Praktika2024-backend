// src/users/dto/create-role.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Название роли',
    example: 'Admin',
  })
  @IsString({ message: 'Название роли должно быть строкой' })
  @IsNotEmpty({ message: 'Название роли не должно быть пустым' })
  name: string;
}
