// src/platforms/platforms.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';

@Injectable()
export class PlatformsService {
  private readonly logger = new Logger(PlatformsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Создание новой платформы
   */
  async createPlatform(createPlatformDto: CreatePlatformDto) {
    const { name } = createPlatformDto;
    this.logger.log(`Создание новой платформы с именем: ${name}`);

    // Проверяем, существует ли уже платформа с таким именем
    const existingPlatform = await this.prisma.platform.findFirst({
      where: { name },
    });
    if (existingPlatform) {
      this.logger.warn(`Платформа с именем ${name} уже существует`);
      throw new ConflictException('Платформа с таким именем уже существует');
    }

    // Создаем новую платформу
    const platform = await this.prisma.platform.create({
      data: { name },
    });
    this.logger.log(`Платформа создана с ID: ${platform.id}`);
    return platform;
  }

  /**
   * Удаление платформы по ID
   */
  async deletePlatform(id: number) {
    this.logger.log(`Удаление платформы с ID: ${id}`);

    // Проверка существования платформы
    const platform = await this.prisma.platform.findUnique({
      where: { id },
    });
    if (!platform) {
      this.logger.warn(`Платформа с ID ${id} не найдена`);
      throw new NotFoundException('Платформа не найдена');
    }

    // Проверка привязок платформы к проектам
    const linkedProjectsCount = await this.prisma.project_platform.count({
      where: { platformId: id },
    });
    if (linkedProjectsCount > 0) {
      this.logger.warn(
        `Платформа с ID ${id} связана с ${linkedProjectsCount} проектами`,
      );
      throw new BadRequestException(
        'Невозможно удалить платформу, так как она привязана к проектам',
      );
    }

    // Удаляем платформу
    await this.prisma.platform.delete({
      where: { id },
    });

    this.logger.log(`Платформа с ID ${id} успешно удалена`);
  }

  /**
   * Получение всех платформ
   */
  async getAllPlatforms() {
    this.logger.log('Получение всех платформ');

    try {
      const platforms = await this.prisma.platform.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      this.logger.log(`Найдено ${platforms.length} платформ`);

      return {
        status: true,
        message: 'Платформы успешно получены',
        platforms,
      };
    } catch (error) {
      this.logger.error('Ошибка при получении платформ:', error);
      return {
        status: false,
        message: 'Ошибка при получении платформ',
      };
    }
  }
}
