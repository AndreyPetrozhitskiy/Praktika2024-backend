import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AssignSkillDto } from './dto/assign-skill.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { RemoveSkillDto } from './dto/remove-skill.dto';
import { SkillsService } from './skills.service';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  // 1. Создание навыка
  @Post('create-skill')
  async createSkill(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.createSkill(createSkillDto);
  }

  // 2. Удаление навыка
  @Delete('delete-skill/:id')
  async deleteSkill(@Param('id') id: number) {
    return this.skillsService.deleteSkill(id);
  }

  // 3. Получение всех навыков
  @Get('skills-all')
  async getAllSkills() {
    return this.skillsService.getAllSkills();
  }

  // 4. Получение всех навыков одной сферы
  @Get('role/:roleId')
  async getSkillsByRole(@Param('roleId') roleId: number) {
    return this.skillsService.getSkillsByRole(roleId);
  }

  // 5. Выдать навык юзеру
  @Post('assign')
  async assignSkillToUser(@Body() assignSkillDto: AssignSkillDto) {
    return this.skillsService.assignSkillToUser(assignSkillDto);
  }

  // 6. Забрать навык у юзера
  @Post('remove-skill')
  async removeSkillFromUser(@Body() removeSkillDto: RemoveSkillDto) {
    return this.skillsService.removeSkillFromUser(removeSkillDto);
  }

  // 7. Получение навыка по ID
  @Get('get-skill/:id')
  async getSkillById(@Param('id') id: number) {
    return this.skillsService.getSkillById(id);
  }

  // 8. Получение всех навыков пользователя
  @Get('get-skill-user/:userId')
  async getUserSkills(@Param('userId') userId: number) {
    return this.skillsService.getUserSkills(userId);
  }
}
