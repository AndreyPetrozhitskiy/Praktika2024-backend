// src/platforms/dto/delete-platform.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeletePlatformDto {
  @ApiProperty({
    description: 'ID платформы для удаления',
    example: 1,
  })
  @IsInt({ message: 'ID платформы должно быть числом' })
  @Min(1, { message: 'ID платформы должно быть положительным числом' })
  id: number;
}
