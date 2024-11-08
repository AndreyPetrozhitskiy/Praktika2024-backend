// src/users/dto/remove-role.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RemoveRoleDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  @IsInt({ message: 'userId должно быть числом' })
  @Min(1, { message: 'userId должно быть положительным числом' })
  userId: number;

  @ApiProperty({
    description: 'ID роли',
    example: 2,
  })
  @IsInt({ message: 'roleId должно быть числом' })
  @Min(1, { message: 'roleId должно быть положительным числом' })
  roleId: number;
}
