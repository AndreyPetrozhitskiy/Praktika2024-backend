// src/users/users.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';
import { UsersService } from './users.service';

@ApiTags('Users') // Группировка эндпоинтов под тегом "Users"
@ApiBearerAuth() // Указывает, что эндпоинты защищены JWT-аутентификацией
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Создание роли
   */
  @Post('role-create')
  @ApiOperation({ summary: 'Создание новой роли' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Роль успешно создана',
    schema: {
      example: {
        id: 1,
        name: 'Admin',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Роль с таким именем уже существует',
    schema: {
      example: {
        status: false,
        message: 'Роль с таким именем уже существует',
      },
    },
  })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.usersService.createRole(createRoleDto);
  }

  /**
   * Удаление роли
   */
  @Delete('role/:id')
  @ApiOperation({ summary: 'Удаление роли по ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID роли для удаления',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Роль успешно удалена',
    schema: {
      example: {
        id: 1,
        name: 'Admin',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Роль с таким ID не найдена',
    schema: {
      example: {
        status: false,
        message: 'Роль с таким id не существует',
      },
    },
  })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteRole(id);
  }

  /**
   * Назначение роли пользователю
   */
  @Put('assign-role')
  @ApiOperation({ summary: 'Назначение роли пользователю' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Роль успешно назначена пользователю',
    schema: {
      example: {
        userId: 1,
        roleId: 2,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Роль уже назначена пользователю или пользователь/роль не найдены',
    schema: {
      example: {
        status: false,
        message: 'У пользователя уже есть эта роль',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь или роль не найдены',
    schema: {
      example: {
        status: false,
        message: 'Пользователь не найден',
      },
    },
  })
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRoleToUser(assignRoleDto);
  }

  /**
   * Удаление роли у пользователя
   */
  @Delete('remove-role')
  @ApiOperation({ summary: 'Удаление роли у пользователя' })
  @ApiBody({ type: RemoveRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Роль успешно удалена у пользователя',
    schema: {
      example: {
        status: true,
        message: 'Роль успешно удалена',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Роль не назначена пользователю',
    schema: {
      example: {
        status: false,
        message: 'Эта роль не назначена пользователю',
      },
    },
  })
  async removeRoleFromUser(@Body() removeRoleDto: RemoveRoleDto) {
    return this.usersService.removeRoleFromUser(removeRoleDto);
  }

  /**
   * Получение всех ролей
   */
  @Get('roles-all')
  @ApiOperation({ summary: 'Получение всех ролей' })
  @ApiResponse({
    status: 200,
    description: 'Роли успешно получены',
    schema: {
      example: [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
      ],
    },
  })
  async getAllRoles() {
    return this.usersService.getAllRoles();
  }

  /**
   * Получение всех пользователей
   */
  @Get('users-all')
  @ApiOperation({ summary: 'Получение всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Пользователи успешно получены',
    schema: {
      example: [
        {
          id: 1,
          name: 'John Doe',
          login: 'johndoe',
          email: 'john@example.com',
          description: 'Developer',
          url: 'https://johndoe.com',
          banned: false,
          banReason: null,
          Projects: [],
          User_skill: [],
          Response: [],
          Favorites: [],
          Project_user: [],
          User_role: [],
        },
        // Другие пользователи...
      ],
    },
  })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * Получение ролей для пользователя
   */
  @Get('roles-users/:id')
  @ApiOperation({ summary: 'Получение ролей для пользователя по ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID пользователя',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Роли пользователя успешно получены',
    schema: {
      example: [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден или у пользователя нет ролей',
    schema: {
      example: {
        status: false,
        message:
          'У пользователя нет назначенных ролей или пользователь не найден',
      },
    },
  })
  async getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserRoles(id);
  }
}
