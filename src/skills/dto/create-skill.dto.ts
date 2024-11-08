// src/skills/dto/create-skill.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Название навыка',
    example: 'TypeScript',
  })
  @IsString({ message: 'name должно быть строкой' })
  @IsNotEmpty({ message: 'name не должно быть пустым' })
  name: string;

  @ApiProperty({
    description: 'ID роли, связанной с навыком',
    example: 1,
  })
  @IsInt({ message: 'roleId должно быть числом' })
  @Min(1, { message: 'roleId должно быть положительным числом' })
  roleId: number;
}
