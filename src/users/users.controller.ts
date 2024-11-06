import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Создание роли

  @Post('role-create')
  async createRole(@Body('name') name: string) {
    return this.usersService.createRole(name);
  }
  // Удаление роли

  @Delete('role/:id')
  async deleteRole(@Param('id') id: string) {
    return this.usersService.deleteRole(Number(id));
  }
  // Выдать роль юзеру

  @Put('assign-role')
  async assignRoleToUser(
    @Body('userId') userId: number,
    @Body('roleId') roleId: number,
  ) {
    return this.usersService.assignRoleToUser(userId, roleId);
  }
  // Забрать роль

  @Delete('remove-role')
  async removeRoleFromUser(
    @Body('userId') userId: number,
    @Body('roleId') roleId: number,
  ) {
    return this.usersService.removeRoleFromUser(userId, roleId);
  }
  // Получить все роли

  @Get('roles-all')
  async getAllRoles() {
    return this.usersService.getAllRoles();
  }
  // Получение всех юзеров

  @Get('users-all')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  // Получение роли для юзера

  @Get('roles-users/:id')
  async getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(Number(id));
  }
}
