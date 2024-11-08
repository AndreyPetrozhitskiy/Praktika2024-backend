// src/skills/skills.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AssignSkillDto } from './dto/assign-skill.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { RemoveSkillDto } from './dto/remove-skill.dto';
import { SkillsService } from './skills.service';

@ApiTags('Skills') // Группировка эндпоинтов под тегом "Skills"
@ApiBearerAuth() // Указывает, что эндпоинты защищены JWT-аутентификацией
@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /**
   * Создание нового навыка
   */
  @Post('create-skill')
  @ApiOperation({ summary: 'Создание нового навыка' })
  @ApiBody({ type: CreateSkillDto })
  @ApiResponse({
    status: 201,
    description: 'Навык успешно создан',
    schema: {
      example: {
        status: true,
        message: 'Навык успешно создан',
        skill: {
          id: 1,
          name: 'TypeScript',
          roleId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Навык с таким именем уже существует',
    schema: {
      example: {
        status: false,
        message: 'Навык с таким именем уже существует',
      },
    },
  })
  async createSkill(@Body() createSkillDto: CreateSkillDto) {
    const skill = await this.skillsService.createSkill(createSkillDto);
    return { status: true, message: 'Навык успешно создан', skill };
  }

  /**
   * Удаление навыка по ID
   */
  @Delete('delete-skill/:id')
  @ApiOperation({ summary: 'Удаление навыка по ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID навыка для удаления',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно удален',
    schema: {
      example: {
        status: true,
        message: 'Навык успешно удален',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Навык не найден',
    schema: {
      example: {
        status: false,
        message: 'Навык не найден',
      },
    },
  })
  async deleteSkill(@Param('id', ParseIntPipe) id: number) {
    await this.skillsService.deleteSkill(id);
    return { status: true, message: 'Навык успешно удален' };
  }

  /**
   * Получение всех навыков
   */
  @Get('skills-all')
  @ApiOperation({ summary: 'Получение всех навыков' })
  @ApiResponse({
    status: 200,
    description: 'Навыки успешно получены',
    schema: {
      example: {
        status: true,
        message: 'Навыки успешно получены',
        skills: [
          { id: 1, name: 'TypeScript', roleId: 1 },
          { id: 2, name: 'JavaScript', roleId: 1 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при получении навыков',
    schema: {
      example: {
        status: false,
        message: 'Ошибка при получении навыков',
      },
    },
  })
  async getAllSkills() {
    const skills = await this.skillsService.getAllSkills();
    return skills;
  }

  /**
   * Получение всех навыков по роли
   */
  @Get('role/:roleId')
  @ApiOperation({ summary: 'Получение всех навыков по роли' })
  @ApiParam({
    name: 'roleId',
    type: 'number',
    description: 'ID роли',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Навыки по роли успешно получены',
    schema: {
      example: {
        status: true,
        message: 'Навыки по роли успешно получены',
        skills: [
          { id: 1, name: 'TypeScript', roleId: 1 },
          { id: 2, name: 'JavaScript', roleId: 1 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Навыки для данной роли не найдены',
    schema: {
      example: {
        status: false,
        message: 'Навыки для данной роли не найдены',
      },
    },
  })
  async getSkillsByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    const skills = await this.skillsService.getSkillsByRole(roleId);
    return skills;
  }

  /**
   * Назначение навыка пользователю
   */
  @Post('assign')
  @ApiOperation({ summary: 'Назначение навыка пользователю' })
  @ApiBody({ type: AssignSkillDto })
  @ApiResponse({
    status: 201,
    description: 'Навык успешно назначен пользователю',
    schema: {
      example: {
        status: true,
        message: 'Навык успешно назначен пользователю',
        newUserSkill: {
          userId: 1,
          skillId: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Навык уже назначен пользователю',
    schema: {
      example: {
        status: false,
        message: 'Навык уже назначен этому пользователю',
      },
    },
  })
  async assignSkillToUser(@Body() assignSkillDto: AssignSkillDto) {
    const result = await this.skillsService.assignSkillToUser(assignSkillDto);
    return result;
  }

  /**
   * Удаление навыка у пользователя
   */
  @Post('remove-skill')
  @ApiOperation({ summary: 'Удаление навыка у пользователя' })
  @ApiBody({ type: RemoveSkillDto })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно удален у пользователя',
    schema: {
      example: {
        status: true,
        message: 'Навык успешно забран у пользователя',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Навык не найден у пользователя',
    schema: {
      example: {
        status: false,
        message: 'Навык не найден у пользователя',
      },
    },
  })
  async removeSkillFromUser(@Body() removeSkillDto: RemoveSkillDto) {
    const result = await this.skillsService.removeSkillFromUser(removeSkillDto);
    return result;
  }

  /**
   * Получение навыка по ID
   */
  @Get('get-skill/:id')
  @ApiOperation({ summary: 'Получение навыка по ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID навыка',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно получен',
    schema: {
      example: {
        status: true,
        message: 'Навык успешно получен',
        skill: { id: 1, name: 'TypeScript', roleId: 1 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Навык не найден',
    schema: {
      example: {
        status: false,
        message: 'Навык не найден',
      },
    },
  })
  async getSkillById(@Param('id', ParseIntPipe) id: number) {
    const skill = await this.skillsService.getSkillById(id);
    return skill;
  }

  /**
   * Получение всех навыков пользователя
   */
  @Get('get-skill-user/:userId')
  @ApiOperation({ summary: 'Получение всех навыков пользователя' })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'ID пользователя',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Навыки пользователя успешно получены',
    schema: {
      example: {
        status: true,
        message: 'Навыки пользователя успешно получены',
        userSkills: [
          {
            userId: 1,
            skillId: 2,
            skill: { id: 2, name: 'JavaScript', roleId: 1 },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'У пользователя нет навыков',
    schema: {
      example: {
        status: false,
        message: 'У пользователя нет навыков',
      },
    },
  })
  async getUserSkills(@Param('userId', ParseIntPipe) userId: number) {
    const userSkills = await this.skillsService.getUserSkills(userId);
    return userSkills;
  }
}
