import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Название проекта',
    example: 'Новый Проект',
  })
  @IsString({ message: 'Имя проекта должно быть строкой' })
  name: string;

  @ApiPropertyOptional({
    description: 'Описание проекта',
    example: 'Описание нового проекта',
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Комментарий к проекту',
    example: 'Комментарий к проекту',
  })
  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  comment?: string;

  @ApiProperty({
    description: 'ID тимлида проекта',
    example: 1,
  })
  @IsInt({ message: 'ID тимлида должно быть числом' })
  teamleadId: number;

  @ApiPropertyOptional({
    description: 'Массив ID ролей, назначенных проекту',
    example: [1, 2],
  })
  @IsOptional()
  @IsArray({ message: 'roleIds должен быть массивом чисел' })
  @ArrayNotEmpty({ message: 'roleIds не должен быть пустым' })
  roleIds?: number[];

  @ApiPropertyOptional({
    description: 'Массив ID навыков, назначенных проекту',
    example: [1, 2],
  })
  @IsOptional()
  @IsArray({ message: 'skillIds должен быть массивом чисел' })
  @ArrayNotEmpty({ message: 'skillIds не должен быть пустым' })
  skillIds?: number[];

  @ApiPropertyOptional({
    description: 'Массив ID платформ, назначенных проекту',
    example: [1, 2],
  })
  @IsOptional()
  @IsArray({ message: 'platformIds должен быть массивом чисел' })
  @ArrayNotEmpty({ message: 'platformIds не должен быть пустым' })
  platformIds?: number[];
}
