// src/skills/skills.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignSkillDto } from './dto/assign-skill.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { RemoveSkillDto } from './dto/remove-skill.dto';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Создание нового навыка
   */
  async createSkill(createSkillDto: CreateSkillDto) {
    const { name, roleId } = createSkillDto;
    this.logger.log(`Создание нового навыка: ${name} для роли ID: ${roleId}`);

    // Проверяем, существует ли уже навык с таким именем
    const existingSkill = await this.prisma.skill.findFirst({
      where: { name },
    });

    if (existingSkill) {
      this.logger.warn(`Навык с именем "${name}" уже существует`);
      return {
        status: false,
        message: 'Навык с таким именем уже существует',
      };
    }

    try {
      // Создаём новый навык
      const skill = await this.prisma.skill.create({
        data: {
          name,
          roleId,
        },
      });

      this.logger.log(`Навык "${name}" создан с ID: ${skill.id}`);
      return { status: true, message: 'Навык успешно создан', skill };
    } catch (error) {
      this.logger.error('Ошибка при создании навыка:', error);
      return {
        status: false,
        message: 'Ошибка при создании навыка',
      };
    }
  }

  /**
   * Удаление навыка по ID
   */
  async deleteSkill(id: number) {
    this.logger.log(`Удаление навыка с ID: ${id}`);

    // Проверяем, существует ли навык
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      this.logger.warn(`Навык с ID ${id} не найден`);
      return {
        status: false,
        message: 'Навык не найден',
      };
    }

    try {
      // Удаляем все связи с этим навыком в User_skill
      await this.prisma.user_skill.deleteMany({
        where: { skillId: id },
      });

      // Удаляем сам навык
      await this.prisma.skill.delete({
        where: { id },
      });

      this.logger.log(`Навык с ID ${id} успешно удалён`);
      return { status: true, message: 'Навык успешно удалён' };
    } catch (error) {
      this.logger.error('Ошибка при удалении навыка:', error);
      return {
        status: false,
        message: 'Ошибка при удалении навыка',
      };
    }
  }

  /**
   * Получение всех навыков
   */
  async getAllSkills() {
    this.logger.log('Получение всех навыков');

    try {
      const skills = await this.prisma.skill.findMany();
      this.logger.log(`Найдено ${skills.length} навыков`);
      return { status: true, message: 'Навыки успешно получены', skills };
    } catch (error) {
      this.logger.error('Ошибка при получении навыков:', error);
      return {
        status: false,
        message: 'Ошибка при получении навыков',
      };
    }
  }

  /**
   * Получение всех навыков по роли
   */
  async getSkillsByRole(roleId: number) {
    this.logger.log(`Получение навыков для роли ID: ${roleId}`);

    try {
      const skills = await this.prisma.skill.findMany({
        where: { roleId },
        orderBy: {
          name: 'asc',
        },
      });

      if (!skills || skills.length === 0) {
        this.logger.warn(`Навыков для роли ID ${roleId} не найдено`);
        return {
          status: false,
          message: 'Навыки для данной роли не найдены',
        };
      }

      this.logger.log(`Найдено ${skills.length} навыков для роли ID ${roleId}`);
      return {
        status: true,
        message: 'Навыки по роли успешно получены',
        skills,
      };
    } catch (error) {
      this.logger.error('Ошибка при получении навыков по роли:', error);
      return {
        status: false,
        message: 'Ошибка при получении навыков по роли',
      };
    }
  }

  /**
   * Назначение навыка пользователю
   */
  async assignSkillToUser(assignSkillDto: AssignSkillDto) {
    const { userId, skillId } = assignSkillDto;
    this.logger.log(
      `Назначение навыка ID ${skillId} пользователю ID ${userId}`,
    );

    // Проверяем, существует ли пользователь
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Пользователь с ID ${userId} не найден`);
      return {
        status: false,
        message: 'Пользователь не найден',
      };
    }

    // Проверяем, существует ли навык
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      this.logger.warn(`Навык с ID ${skillId} не найден`);
      return {
        status: false,
        message: 'Навык не найден',
      };
    }

    // Проверяем, есть ли уже этот навык у пользователя
    const existingUserSkill = await this.prisma.user_skill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    if (existingUserSkill) {
      this.logger.warn(
        `Навык ID ${skillId} уже назначен пользователю ID ${userId}`,
      );
      return {
        status: false,
        message: 'Навык уже назначен этому пользователю',
      };
    }

    try {
      // Назначаем навык пользователю
      const newUserSkill = await this.prisma.user_skill.create({
        data: {
          userId,
          skillId,
        },
      });

      this.logger.log(
        `Навык ID ${skillId} успешно назначен пользователю ID ${userId}`,
      );
      return {
        status: true,
        message: 'Навык успешно назначен пользователю',
        newUserSkill,
      };
    } catch (error) {
      this.logger.error('Ошибка при назначении навыка пользователю:', error);
      return {
        status: false,
        message: 'Ошибка при назначении навыка пользователю',
      };
    }
  }

  /**
   * Удаление навыка у пользователя
   */
  async removeSkillFromUser(removeSkillDto: RemoveSkillDto) {
    const { userId, skillId } = removeSkillDto;
    this.logger.log(
      `Удаление навыка ID ${skillId} у пользователя ID ${userId}`,
    );

    // Проверяем, существует ли связь между пользователем и навыком
    const userSkill = await this.prisma.user_skill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    if (!userSkill) {
      this.logger.warn(
        `Навык ID ${skillId} не найден у пользователя ID ${userId}`,
      );
      return {
        status: false,
        message: 'Навык не найден у пользователя',
      };
    }

    try {
      // Удаляем навык у пользователя
      await this.prisma.user_skill.delete({
        where: {
          userId_skillId: {
            userId,
            skillId,
          },
        },
      });

      this.logger.log(
        `Навык ID ${skillId} успешно удалён у пользователя ID ${userId}`,
      );
      return {
        status: true,
        message: 'Навык успешно забран у пользователя',
      };
    } catch (error) {
      this.logger.error('Ошибка при удалении навыка у пользователя:', error);
      return {
        status: false,
        message: 'Ошибка при удалении навыка у пользователя',
      };
    }
  }

  /**
   * Получение навыка по ID
   */
  async getSkillById(id: number) {
    this.logger.log(`Получение навыка по ID: ${id}`);

    try {
      const skill = await this.prisma.skill.findUnique({
        where: { id },
      });

      if (!skill) {
        this.logger.warn(`Навык с ID ${id} не найден`);
        return {
          status: false,
          message: 'Навык не найден',
        };
      }

      this.logger.log(`Навык с ID ${id} успешно получен`);
      return { status: true, message: 'Навык успешно получен', skill };
    } catch (error) {
      this.logger.error('Ошибка при получении навыка:', error);
      return {
        status: false,
        message: 'Ошибка при получении навыка',
      };
    }
  }

  /**
   * Получение всех навыков пользователя
   */
  async getUserSkills(userId: number) {
    this.logger.log(`Получение всех навыков пользователя ID: ${userId}`);

    // Проверяем, существует ли пользователь
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Пользователь с ID ${userId} не найден`);
      return {
        status: false,
        message: 'Пользователь не найден',
      };
    }

    try {
      const userSkills = await this.prisma.user_skill.findMany({
        where: { userId },
        include: {
          skill: true, // Включаем данные о навыке
        },
      });

      if (userSkills.length === 0) {
        this.logger.warn(`У пользователя ID ${userId} нет навыков`);
        return {
          status: false,
          message: 'У пользователя нет навыков',
        };
      }

      this.logger.log(
        `У пользователя ID ${userId} найдено ${userSkills.length} навыков`,
      );
      return {
        status: true,
        message: 'Навыки пользователя успешно получены',
        userSkills,
      };
    } catch (error) {
      this.logger.error('Ошибка при получении навыков пользователя:', error);
      return {
        status: false,
        message: 'Ошибка при получении навыков пользователя',
      };
    }
  }
}
