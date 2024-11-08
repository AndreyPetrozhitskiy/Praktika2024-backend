// src/users/users.service.ts

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Создание новой роли
   */
  async createRole(createRoleDto: CreateRoleDto) {
    const { name } = createRoleDto;
    this.logger.log(`Создание новой роли: ${name}`);

    // Проверка, существует ли уже роль с таким именем
    const existingRole = await this.prisma.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      this.logger.warn(`Роль с именем "${name}" уже существует`);
      throw new BadRequestException({
        status: false,
        message: 'Роль с таким именем уже существует',
      });
    }

    try {
      // Создание новой роли
      const role = await this.prisma.role.create({
        data: { name },
      });

      this.logger.log(`Роль "${name}" успешно создана с ID: ${role.id}`);
      return { status: true, message: 'Роль успешно создана', role };
    } catch (error) {
      this.logger.error('Ошибка при создании роли:', error);
      throw new BadRequestException({
        status: false,
        message: 'Ошибка при создании роли',
      });
    }
  }

  /**
   * Удаление роли по ID
   */
  async deleteRole(roleId: number) {
    this.logger.log(`Удаление роли с ID: ${roleId}`);

    // Проверка, существует ли роль с данным ID
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      this.logger.warn(`Роль с ID ${roleId} не найдена`);
      throw new NotFoundException({
        status: false,
        message: 'Роль с таким id не существует',
      });
    }

    try {
      // Удаление роли
      await this.prisma.role.delete({
        where: { id: roleId },
      });

      this.logger.log(`Роль с ID ${roleId} успешно удалена`);
      return { status: true, message: 'Роль успешно удалена' };
    } catch (error) {
      this.logger.error('Ошибка при удалении роли:', error);
      throw new BadRequestException({
        status: false,
        message: 'Ошибка при удалении роли',
      });
    }
  }

  /**
   * Назначение роли пользователю
   */
  async assignRoleToUser(assignRoleDto: AssignRoleDto) {
    const { userId, roleId } = assignRoleDto;
    this.logger.log(`Назначение роли ID ${roleId} пользователю ID ${userId}`);

    // Проверка, существует ли роль
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      this.logger.warn(`Роль с ID ${roleId} не найдена`);
      throw new NotFoundException({
        status: false,
        message: 'Роль не найдена',
      });
    }

    // Проверка, существует ли пользователь
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Пользователь с ID ${userId} не найден`);
      throw new NotFoundException({
        status: false,
        message: 'Пользователь не найден',
      });
    }

    // Проверка, есть ли уже эта роль у пользователя
    const userRole = await this.prisma.user_role.findFirst({
      where: { userId, roleId },
    });

    if (userRole) {
      this.logger.warn(
        `У пользователя ID ${userId} уже есть роль ID ${roleId}`,
      );
      throw new BadRequestException({
        status: false,
        message: 'У пользователя уже есть эта роль',
      });
    }

    try {
      // Назначение роли пользователю
      const newUserRole = await this.prisma.user_role.create({
        data: { userId, roleId },
      });

      this.logger.log(
        `Роль ID ${roleId} успешно назначена пользователю ID ${userId}`,
      );
      return {
        status: true,
        message: 'Роль успешно назначена пользователю',
        newUserRole,
      };
    } catch (error) {
      this.logger.error('Ошибка при назначении роли пользователю:', error);
      throw new BadRequestException({
        status: false,
        message: 'Ошибка при назначении роли пользователю',
      });
    }
  }

  /**
   * Удаление роли у пользователя
   */
  async removeRoleFromUser(removeRoleDto: RemoveRoleDto) {
    const { userId, roleId } = removeRoleDto;
    this.logger.log(`Удаление роли ID ${roleId} у пользователя ID ${userId}`);

    try {
      // Проверка существования связи между пользователем и ролью
      const userRole = await this.prisma.user_role.findFirst({
        where: { userId, roleId },
      });

      if (!userRole) {
        this.logger.warn(
          `Роль ID ${roleId} не назначена пользователю ID ${userId}`,
        );
        throw new NotFoundException({
          status: false,
          message: 'Эта роль не назначена пользователю',
        });
      }

      // Удаление связи между пользователем и ролью
      await this.prisma.user_role.deleteMany({
        where: { userId, roleId },
      });

      this.logger.log(
        `Роль ID ${roleId} успешно удалена у пользователя ID ${userId}`,
      );
      return { status: true, message: 'Роль успешно удалена' };
    } catch (error) {
      this.logger.error('Ошибка при удалении роли у пользователя:', error);
      throw new BadRequestException({
        status: false,
        message: 'Ошибка при удалении роли у пользователя',
      });
    }
  }

  /**
   * Получение всех ролей
   */
  async getAllRoles() {
    this.logger.log('Получение всех ролей');

    try {
      const roles = await this.prisma.role.findMany();
      this.logger.log(`Найдено ${roles.length} ролей`);
      return { status: true, message: 'Роли успешно получены', roles };
    } catch (error) {
      this.logger.error('Ошибка при получении ролей:', error);
      throw new BadRequestException({
        status: false,
        message: 'Ошибка при получении ролей',
      });
    }
  }

  /**
   * Получение всех пользователей
   */
  async getAllUsers() {
    this.logger.log('Получение всех пользователей');

    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          login: true,
          email: true,
          description: true,
          url: true,
          banned: true,
          banReason: true,
          Projects: true,
          User_skill: true,
          Response: true,
          Favorites: true,
          Project_user: true,
          User_role: true,
        },
      });
      this.logger.log(`Найдено ${users.length} пользователей`);
      return { status: true, message: 'Пользователи успешно получены', users };
    } catch (error) {
      this.logger.error('Ошибка при получении пользователей:', error);
      throw new BadRequestException({
        status: false,
        message: 'Ошибка при получении пользователей',
      });
    }
  }

  /**
   * Получение ролей для пользователя по ID
   */
  async getUserRoles(userId: number) {
    this.logger.log(`Получение ролей для пользователя ID: ${userId}`);

    try {
      const userRoles = await this.prisma.user_role.findMany({
        where: { userId },
        include: {
          role: true, // Включаем данные о роли
        },
      });

      if (userRoles.length === 0) {
        this.logger.warn(
          `У пользователя ID ${userId} нет назначенных ролей или пользователь не найден`,
        );
        throw new NotFoundException({
          status: false,
          message:
            'У пользователя нет назначенных ролей или пользователь не найден',
        });
      }

      const roles = userRoles.map((userRole) => userRole.role);
      this.logger.log(
        `У пользователя ID ${userId} назначено ${roles.length} ролей`,
      );
      return {
        status: true,
        message: 'Роли пользователя успешно получены',
        roles,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Ошибка при получении ролей пользователя:', error);
      throw new BadRequestException({
        status: false,
        message: 'Ошибка при получении ролей пользователя',
      });
    }
  }
}
