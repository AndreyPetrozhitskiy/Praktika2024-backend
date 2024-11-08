// src/platforms/platforms.controller.ts

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
import { CreatePlatformDto } from './dto/create-platform.dto';
import { PlatformsService } from './platforms.service';

@ApiTags('Platforms') // Группировка эндпоинтов под тегом "Platforms"
@ApiBearerAuth() // Указывает, что эндпоинты защищены JWT-аутентификацией
@UseGuards(JwtAuthGuard)
@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  /**
   * Создание новой платформы
   */
  @Post('create')
  @ApiOperation({ summary: 'Создание новой платформы' })
  @ApiBody({ type: CreatePlatformDto })
  @ApiResponse({
    status: 201,
    description: 'Платформа успешно создана',
    schema: {
      example: {
        status: true,
        data: {
          platform: {
            id: 1,
            name: 'Web',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Платформа с таким именем уже существует',
    schema: {
      example: {
        status: false,
        message: 'Платформа с таким именем уже существует',
      },
    },
  })
  async createPlatform(@Body() createPlatformDto: CreatePlatformDto) {
    const platform =
      await this.platformsService.createPlatform(createPlatformDto);
    return { status: true, data: { platform } };
  }

  /**
   * Удаление платформы по ID
   */
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Удаление платформы по ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID платформы для удаления',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Платформа успешно удалена',
    schema: {
      example: {
        status: true,
        message: 'Платформа успешно удалена',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Платформа не найдена',
    schema: {
      example: {
        status: false,
        message: 'Платформа не найдена',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Платформа связана с проектами и не может быть удалена',
    schema: {
      example: {
        status: false,
        message:
          'Невозможно удалить платформу, так как она привязана к проектам',
      },
    },
  })
  async deletePlatform(
    @Param('id', ParseIntPipe) id: number, // Используем ParseIntPipe для преобразования и валидации
  ) {
    await this.platformsService.deletePlatform(id);
    return { status: true, message: 'Платформа успешно удалена' };
  }
  @Get('all')
  @ApiOperation({ summary: 'Получение всех платформ' })
  @ApiResponse({
    status: 200,
    description: 'Платформы успешно получены',
    schema: {
      example: {
        status: true,
        message: 'Платформы успешно получены',
        platforms: [
          { id: 1, name: 'Windows' },
          { id: 2, name: 'Linux' },
          // Другие платформы...
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при получении платформ',
    schema: {
      example: {
        status: false,
        message: 'Ошибка при получении платформ',
      },
    },
  })
  async getAllPlatforms() {
    return this.platformsService.getAllPlatforms();
  }
}
