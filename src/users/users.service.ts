import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  // Создание роли
  async createRole(name: string) {
    // Проверка, существует ли уже роль с таким именем
    const existingRole = await this.prisma.role.findFirst({
      where: { name },
    });
    if (existingRole) {
      throw new BadRequestException({
        status: false,
        messgae: 'Роль с таким именем уже существует',
      });
    }

    // Создание новой роли
    return this.prisma.role.create({
      data: { name },
    });
  }

  // Удаление роли
  async deleteRole(roleId: number) {
    // Проверяем, существует ли роль с данным ID
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException({
        status: false,
        messgae: 'Роль с таким id не существует',
      });
    }

    return this.prisma.role.delete({
      where: { id: roleId },
    });
  }
  // Выдать роль юзеру
  async assignRoleToUser(userId: number, roleId: number) {
    // Проверяем, существует ли роль
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException({
        status: false,
        message: 'Роль не найдена',
      });
    }

    // Проверяем, существует ли пользователь
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        status: false,
        message: 'Пользователь не найден',
      });
    }

    // Проверяем, есть ли уже эта роль у пользователя
    const userRole = await this.prisma.user_role.findFirst({
      where: { userId, roleId },
    });

    if (userRole) {
      throw new BadRequestException({
        status: false,
        message: 'У пользователя уже есть эта роль',
      });
    }

    return this.prisma.user_role.create({
      data: { userId, roleId },
    });
  }
  // Забрать роль
  async removeRoleFromUser(userId: number, roleId: number) {
    try {
      // Проверяем, существует ли связь между пользователем и ролью
      const userRole = await this.prisma.user_role.findFirst({
        where: { userId, roleId },
      });

      // Если связи нет, выбрасываем исключение
      if (!userRole) {
        throw new NotFoundException({
          status: false,
          message: 'Эта роль не назначена пользователю',
        });
      }

      // Логируем найденную запись для отладки
      console.log('Found user-role:', userRole);

      // Удаляем связь между пользователем и ролью
      const deleteResult = await this.prisma.user_role.deleteMany({
        where: { userId, roleId },
      });

      // Логируем результат удаления
      console.log('Delete result:', deleteResult);

      // Если количество удаленных записей 0, то это значит, что связь не была удалена
      if (deleteResult.count === 0) {
        throw new Error('Не удалось удалить роль');
      }

      return { status: true, message: 'Роль успешно удалена' };
    } catch (error) {
      console.error('Error in removeRoleFromUser:', error); // Логируем ошибку для отладки
      throw error; // Перебрасываем ошибку
    }
  }
  // Поулчение всех ролей
  async getAllRoles() {
    return this.prisma.role.findMany();
  }
  // Поулчение всех пользователей
  async getAllUsers() {
    return this.prisma.user.findMany({
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
  }
  // Получение ролей для юзера
  async getUserRoles(userId: number) {
    const userRoles = await this.prisma.user_role.findMany({
      where: { userId },
      include: {
        role: true, // Включаем данные о роли
      },
    });

    if (userRoles.length === 0) {
      throw new NotFoundException({
        status: false,
        message:
          'У пользователя нет назначенных ролей или пользователь не найден',
      });
    }

    return userRoles.map((userRole) => userRole.role); // Возвращаем только роли
  }
}
