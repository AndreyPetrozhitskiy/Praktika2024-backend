import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignSkillDto } from './dto/assign-skill.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { RemoveSkillDto } from './dto/remove-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  // 1. Создание навыка
  async createSkill(createSkillDto: CreateSkillDto) {
    try {
      // Проверяем, существует ли уже навык с таким именем
      const existingSkill = await this.prisma.skill.findFirst({
        where: { name: createSkillDto.name },
      });

      // Если навык существует, возвращаем ошибку
      if (existingSkill) {
        return {
          status: false,
          message: 'Навык с таким именем уже существует',
        };
      }

      // Создаем новый навык
      const skill = await this.prisma.skill.create({
        data: createSkillDto,
      });

      return { status: true, message: 'Навык успешно создан', skill };
    } catch (error) {
      // Обработка ошибок
      console.error(error); // Логируем ошибку для отладки
      return {
        status: false,
        message: 'Ошибка при создании навыка',
      };
    }
  }

  // 2. Удаление навыка
  async deleteSkill(id: number) {
    try {
      const skillId = Number(id);
      console.log(typeof skillId);
      // Проверяем, существует ли навык
      const skill = await this.prisma.skill.findUnique({
        where: { id: skillId },
      });

      if (!skill) {
        return {
          status: false,
          message: 'Навык не найден',
        };
      }

      // Удаляем все связи с этим навыком в User_skill
      await this.prisma.user_skill.deleteMany({
        where: { skillId: skillId },
      });

      // Удаляем сам навык
      await this.prisma.skill.delete({
        where: { id: skillId },
      });

      return {
        status: true,
        message: 'Навык успешно удален',
      };
    } catch (error) {
      console.error('Ошибка при удалении навыка:', error);
      return {
        status: false,
        message: 'Ошибка при удалении навыка',
      };
    }
  }

  // 3. Получение всех навыков
  async getAllSkills() {
    try {
      const skills = await this.prisma.skill.findMany();
      return { status: true, message: 'Навыки успешно получены', skills };
    } catch (error) {
      return {
        status: false,
        message: 'Ошибка при получении навыков',
      };
    }
  }

  // 4. Получение всех навыков одной сферы
  async getSkillsByRole(roleId: number) {
    try {
      const id = Number(roleId);
      const skills = await this.prisma.skill.findMany({
        where: { roleId: id },
        orderBy: {
          name: 'asc',
        },
      });

      if (!skills || skills.length === 0) {
        return {
          status: false,
          message: 'Навыки для этой сферы не найдены',
        };
      }

      return {
        status: true,
        message: 'Навыки по сфере успешно получены',
        skills,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Ошибка при получении навыков по сфере',
      };
    }
  }

  // 5. Выдать навык юзеру
  async assignSkillToUser(assignSkillDto: AssignSkillDto) {
    try {
      // Проверяем, есть ли уже этот навык у пользователя
      const userSkill = await this.prisma.user_skill.findUnique({
        where: {
          userId_skillId: {
            userId: assignSkillDto.userId,
            skillId: assignSkillDto.skillId,
          },
        },
      });

      if (userSkill) {
        return {
          status: false,
          message: 'Навык уже назначен этому пользователю',
        };
      }

      // Назначаем навык пользователю
      const newUserSkill = await this.prisma.user_skill.create({
        data: {
          userId: assignSkillDto.userId,
          skillId: assignSkillDto.skillId,
        },
      });

      return {
        status: true,
        message: 'Навык успешно назначен пользователю',
        newUserSkill,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Ошибка при назначении навыка пользователю',
      };
    }
  }

  // 6. Забрать навык у юзера
  async removeSkillFromUser(removeSkillDto: RemoveSkillDto) {
    try {
      // Ищем запись в связи с этим навыком и пользователем
      const userSkill = await this.prisma.user_skill.findUnique({
        where: {
          userId_skillId: {
            userId: removeSkillDto.userId,
            skillId: removeSkillDto.skillId,
          },
        },
      });

      if (!userSkill) {
        return {
          status: false,
          message: 'Навык не найден у пользователя',
        };
      }

      // Удаляем навык у пользователя
      await this.prisma.user_skill.delete({
        where: {
          userId_skillId: {
            userId: removeSkillDto.userId,
            skillId: removeSkillDto.skillId,
          },
        },
      });

      return {
        status: true,
        message: 'Навык успешно забран у пользователя',
      };
    } catch (error) {
      return {
        status: false,
        message: 'Ошибка при удалении навыка у пользователя',
      };
    }
  }

  // 7. Получение навыка по ID
  async getSkillById(id: number) {
    try {
      const skillId = Number(id);
      const skill = await this.prisma.skill.findUnique({
        where: { id: skillId },
      });

      if (!skill) {
        return {
          status: false,
          message: 'Навык не найден',
        };
      }

      return { status: true, message: 'Навык успешно получен', skill };
    } catch (error) {
      return {
        status: false,
        message: 'Ошибка при получении навыка',
      };
    }
  }

  // 8. Получение всех навыков пользователя
  async getUserSkills(userId: number) {
    try {
      const id = Number(userId);
      const userSkills = await this.prisma.user_skill.findMany({
        where: { userId: id },
        include: {
          skill: true, // Включаем данные о навыке
        },
      });

      if (userSkills.length === 0) {
        return {
          status: false,
          message: 'У пользователя нет навыков',
        };
      }

      return {
        status: true,
        message: 'Навыки пользователя успешно получены',
        userSkills,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Ошибка при получении навыков пользователя',
      };
    }
  }
}
