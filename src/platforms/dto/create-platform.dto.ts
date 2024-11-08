// src/platforms/dto/create-platform.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlatformDto {
  @ApiProperty({
    description: 'Название платформы',
    example: 'Web',
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не должно быть пустым' })
  name: string;
}
