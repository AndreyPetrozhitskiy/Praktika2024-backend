import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // Начало регистрации
  @Post('registration')
  async requestVerificationCode(@Body() body: RegisterDto) {
    await this.authService.saveUserData(body);
    return { message: 'Код отправлен на почту', status: true };
  }
  // Конец регистрации
  @Post('registration-code')
  async registration(@Body() body: { email: string; code: string }) {
    const user = await this.authService.verifyAndRegisterUser(
      body.email,
      body.code,
    );
    return { message: 'Регистрация успешна', user };
  }

  // Проверка токена
  @UseGuards(JwtAuthGuard)
  @Post('check-token')
  checkToken() {
    return { message: 'Токен валиден, доступ разрешен', status: true };
  }

  // // Авторизация
  @Post('login')
  async login(@Body() body: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(body.loginOrEmail, body.password);
  }

  // // Выдать роль
  // @Post('role')
  // getRole() {
  //   return this.authService.getRole();
  // }

  // // Выдать роль
  // @Post('skill')
  // getSkill() {
  //   return this.authService.getSkill();
  // }
}
