import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID роли, которую необходимо назначить проекту',
    example: 1,
  })
  @IsInt({ message: 'roleId должно быть числом' })
  roleId: number;
}
