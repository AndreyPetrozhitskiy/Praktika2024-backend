// src/skills/dto/assign-skill.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AssignSkillDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  @IsInt({ message: 'userId должно быть числом' })
  @Min(1, { message: 'userId должно быть положительным числом' })
  userId: number;

  @ApiProperty({
    description: 'ID навыка',
    example: 2,
  })
  @IsInt({ message: 'skillId должно быть числом' })
  @Min(1, { message: 'skillId должно быть положительным числом' })
  skillId: number;
}
