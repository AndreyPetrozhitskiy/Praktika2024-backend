// src/platforms/dto/get-all-platforms.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class GetAllPlatformsDto {
  @ApiProperty({
    description: 'Флаг для включения дополнительной информации',
    example: true,
    required: false,
  })
  includeDetails?: boolean;
}
