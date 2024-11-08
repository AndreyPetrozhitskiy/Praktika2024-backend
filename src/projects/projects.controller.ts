// src/projects/projects.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddUserDto } from './dto/add-user.dto';
import { AssignPlatformDto } from './dto/assign-platform.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignSkillDto } from './dto/assign-skill.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects') // Группировка эндпоинтов по тегу "Projects"
@ApiBearerAuth() // Указывает, что эндпоинты защищены JWT
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 1. Создание проекта
  @Post('create')
  @ApiOperation({ summary: 'Создание нового проекта' })
  @ApiResponse({ status: 201, description: 'Проект успешно создан.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса.' })
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  // 2. Выдать роль проекту
  @Patch(':projectId/assign-role')
  @ApiOperation({ summary: 'Назначение роли проекту' })
  @ApiParam({ name: 'projectId', type: Number, description: 'ID проекта' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Роль успешно назначена.' })
  @ApiResponse({ status: 404, description: 'Проект или роль не найдены.' })
  async assignRole(
    @Param('projectId') projectId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    const projId = Number(projectId);
    return this.projectsService.assignRole(projId, assignRoleDto.roleId);
  }

  // 3. Выдать навыки проекту
  @Patch(':projectId/assign-skill')
  @ApiOperation({ summary: 'Назначение навыка проекту' })
  @ApiParam({ name: 'projectId', type: Number, description: 'ID проекта' })
  @ApiBody({ type: AssignSkillDto })
  @ApiResponse({ status: 200, description: 'Навык успешно назначен.' })
  @ApiResponse({ status: 404, description: 'Проект или навык не найдены.' })
  async assignSkill(
    @Param('projectId') projectId: string,
    @Body() assignSkillDto: AssignSkillDto,
  ) {
    const projId = Number(projectId);
    return this.projectsService.assignSkill(projId, assignSkillDto.skillId);
  }

  // 4. Выдать платформу проекту
  @Patch(':projectId/assign-platform')
  @ApiOperation({ summary: 'Назначение платформы проекту' })
  @ApiParam({ name: 'projectId', type: Number, description: 'ID проекта' })
  @ApiBody({ type: AssignPlatformDto })
  @ApiResponse({ status: 200, description: 'Платформа успешно назначена.' })
  @ApiResponse({ status: 404, description: 'Проект или платформа не найдены.' })
  async assignPlatform(
    @Param('projectId') projectId: string,
    @Body() assignPlatformDto: AssignPlatformDto,
  ) {
    const projId = Number(projectId);
    return this.projectsService.assignPlatform(
      projId,
      assignPlatformDto.platformId,
    );
  }

  // 5. Добавить юзера к проекту
  @Patch(':projectId/add-user')
  @ApiOperation({ summary: 'Добавление пользователя к проекту' })
  @ApiParam({ name: 'projectId', type: Number, description: 'ID проекта' })
  @ApiBody({ type: AddUserDto })
  @ApiResponse({ status: 200, description: 'Пользователь успешно добавлен.' })
  @ApiResponse({
    status: 404,
    description: 'Проект или пользователь не найдены.',
  })
  async addUser(
    @Param('projectId') projectId: string,
    @Body() addUserDto: AddUserDto,
  ) {
    const projId = Number(projectId);
    return this.projectsService.addUser(projId, addUserDto.userId);
  }

  // 6. Удалить юзера из проекта
  @Delete(':projectId/remove-user/:userId')
  @ApiOperation({ summary: 'Удаление пользователя из проекта' })
  @ApiParam({ name: 'projectId', type: Number, description: 'ID проекта' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удален.' })
  @ApiResponse({
    status: 404,
    description: 'Связь между проектом и пользователем не найдена.',
  })
  async removeUser(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    const projId = Number(projectId);
    const usrId = Number(userId);
    return this.projectsService.removeUser(projId, usrId);
  }

  // 7. Получить все проекты
  @Get()
  @ApiOperation({ summary: 'Получение всех проектов' })
  @ApiResponse({ status: 200, description: 'Список проектов успешно получен.' })
  async getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  // 8. Получить проект по ID
  @Get(':id')
  @ApiOperation({ summary: 'Получение проекта по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID проекта' })
  @ApiResponse({ status: 200, description: 'Проект успешно получен.' })
  @ApiResponse({ status: 404, description: 'Проект не найден.' })
  async getProjectById(@Param('id') id: string) {
    const projId = Number(id);
    return this.projectsService.getProjectById(projId);
  }

  // 9. Удалить проект
  @Delete(':id')
  @ApiOperation({ summary: 'Удаление проекта' })
  @ApiParam({ name: 'id', type: Number, description: 'ID проекта' })
  @ApiResponse({ status: 200, description: 'Проект успешно удален.' })
  @ApiResponse({ status: 404, description: 'Проект не найден.' })
  async deleteProject(@Param('id') id: string) {
    const projId = Number(id);
    return this.projectsService.deleteProject(projId);
  }
}
