import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AssignSkillDto {
  @ApiProperty({
    description: 'ID навыка, который необходимо назначить проекту',
    example: 1,
  })
  @IsInt({ message: 'skillId должно быть числом' })
  skillId: number;
}
