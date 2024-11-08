import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AssignPlatformDto {
  @ApiProperty({
    description: 'ID платформы, которую необходимо назначить проекту',
    example: 2,
  })
  @IsInt({ message: 'platformId должно быть числом' })
  platformId: number;
}
