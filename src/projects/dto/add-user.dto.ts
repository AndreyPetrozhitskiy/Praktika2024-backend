import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddUserDto {
  @ApiProperty({
    description: 'ID пользователя, которого необходимо добавить к проекту',
    example: 3,
  })
  @IsInt({ message: 'userId должно быть числом' })
  userId: number;
}
