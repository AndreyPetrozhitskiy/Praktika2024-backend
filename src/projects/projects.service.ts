// src/projects/projects.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 1. Создание нового проекта
   */
  async createProject(createProjectDto: CreateProjectDto) {
    const {
      name,
      description,
      comment,
      teamleadId,
      roleIds,
      skillIds,
      platformIds,
    } = createProjectDto;

    // Проверка существования тимлида
    const teamlead = await this.prisma.user.findUnique({
      where: { id: teamleadId },
    });
    if (!teamlead) {
      throw new NotFoundException('Teamlead не найден');
    }

    // Создание проекта
    const project = await this.prisma.project.create({
      data: {
        name,
        description,
        comment,
        teamleadId,
      },
    });

    // Назначение ролей проекту, если указаны
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        await this.assignRole(project.id, roleId);
      }
    }

    // Назначение навыков проекту, если указаны
    if (skillIds && skillIds.length > 0) {
      for (const skillId of skillIds) {
        await this.assignSkill(project.id, skillId);
      }
    }

    // Назначение платформ проекту, если указаны
    if (platformIds && platformIds.length > 0) {
      for (const platformId of platformIds) {
        await this.assignPlatform(project.id, platformId);
      }
    }

    return { status: true, project };
  }

  /**
   * 2. Назначение роли проекту
   * В текущей Prisma-схеме роли связаны с пользователями через User_role.
   * Здесь предполагается, что роль назначается тимлиду проекта.
   */
  async assignRole(projectId: number, roleId: number) {
    // Проверка существования проекта
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Проверка существования роли
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }

    // Проверка, не назначена ли уже эта роль тимлиду проекта
    const existing = await this.prisma.user_role.findFirst({
      where: { roleId, userId: project.teamleadId },
    });
    if (existing) {
      throw new BadRequestException('Роль уже назначена тимлиду проекта');
    }

    // Назначение роли тимлиду проекта через User_role
    const userRole = await this.prisma.user_role.create({
      data: {
        roleId,
        userId: project.teamleadId,
      },
    });

    return { status: true, userRole };
  }

  /**
   * 3. Назначение навыка проекту
   * В текущей Prisma-схеме навыки связаны с пользователями через User_skill.
   * Здесь предполагается, что навык назначается тимлиду проекта или можно расширить логику.
   */
  async assignSkill(projectId: number, skillId: number) {
    // Проверка существования проекта
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Проверка существования навыка
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });
    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    // Назначение навыка тимлиду проекта через User_skill
    const existing = await this.prisma.user_skill.findFirst({
      where: { skillId, userId: project.teamleadId },
    });
    if (existing) {
      throw new BadRequestException('Навык уже назначен тимлиду проекта');
    }

    const userSkill = await this.prisma.user_skill.create({
      data: {
        skillId,
        userId: project.teamleadId,
      },
    });

    return { status: true, userSkill };
  }

  /**
   * 4. Назначение платформы проекту
   */
  async assignPlatform(projectId: number, platformId: number) {
    // Проверка существования проекта
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Проверка существования платформы
    const platform = await this.prisma.platform.findUnique({
      where: { id: platformId },
    });
    if (!platform) {
      throw new NotFoundException('Платформа не найдена');
    }

    // Проверка, не назначена ли уже эта платформа проекту
    const existing = await this.prisma.project_platform.findFirst({
      where: { projectId, platformId },
    });
    if (existing) {
      throw new BadRequestException('Платформа уже назначена проекту');
    }

    // Назначение платформы проекту
    const projectPlatform = await this.prisma.project_platform.create({
      data: {
        projectId,
        platformId,
      },
    });

    return { status: true, projectPlatform };
  }

  /**
   * 5. Добавление пользователя к проекту
   */
  async addUser(projectId: number, userId: number) {
    // Проверка существования проекта
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { Project_user: true },
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Проверка существования пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверка, не добавлен ли уже пользователь в проект
    const existing = await this.prisma.project_user.findFirst({
      where: { projectId, userId },
    });
    if (existing) {
      throw new BadRequestException('Пользователь уже добавлен в проект');
    }

    // Добавление пользователя к проекту
    const projectUser = await this.prisma.project_user.create({
      data: {
        projectId,
        userId,
      },
    });

    return { status: true, projectUser };
  }

  /**
   * 6. Удаление пользователя из проекта
   */
  async removeUser(projectId: number, userId: number) {
    // Проверка существования связи между проектом и пользователем
    const projectUser = await this.prisma.project_user.findUnique({
      where: {
        projectId_userId_unique: {
          // Используйте явное имя уникального ключа
          projectId,
          userId,
        },
      },
    });

    if (!projectUser) {
      throw new NotFoundException(
        'Связь между проектом и пользователем не найдена',
      );
    }

    // Удаление пользователя из проекта
    await this.prisma.project_user.delete({
      where: {
        projectId_userId_unique: {
          // Используйте явное имя уникального ключа
          projectId,
          userId,
        },
      },
    });

    return { status: true, message: 'Пользователь удален из проекта' };
  }

  /**
   * 7. Получение всех проектов
   */
  async getAllProjects() {
    const projects = await this.prisma.project.findMany({
      include: {
        user: true, // тимлид
        Response: true,
        Favorites: true,
        Project_user: {
          include: { user: true },
        },
        Project_platform: {
          include: { platform: true },
        },
      },
    });

    return { status: true, projects };
  }

  /**
   * 8. Получение проекта по ID
   */
  async getProjectById(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true, // тимлид
        Response: true,
        Favorites: true,
        Project_user: {
          include: { user: true },
        },
        Project_platform: {
          include: { platform: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    return { status: true, project };
  }

  /**
   * 9. Удаление проекта
   */
  async deleteProject(projectId: number) {
    // Проверка существования проекта
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Удаление связанных записей
    await this.prisma.project_platform.deleteMany({
      where: { projectId },
    });

    await this.prisma.project_user.deleteMany({
      where: { projectId },
    });

    await this.prisma.response.deleteMany({
      where: { projectId },
    });

    await this.prisma.favorites.deleteMany({
      where: { projectId },
    });

    // Удаление проекта
    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { status: true, message: 'Проект успешно удален' };
  }
}
