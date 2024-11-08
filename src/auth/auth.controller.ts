// src/auth/auth.controller.ts

import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordWithTokenDto } from './dto/reset-password-with-token.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication') // Группировка эндпоинтов под тегом "Authentication"
@ApiBearerAuth() // Указывает, что эндпоинты защищены JWT-аутентификацией
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Начало регистрации: отправка кода подтверждения на email
   */
  @Post('registration')
  @ApiOperation({ summary: 'Отправка регистрационного кода на email' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Код отправлен на почту',
    schema: {
      example: { message: 'Код отправлен на почту', status: true },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email или логином уже существует',
    schema: {
      example: {
        message: 'Пользователь с таким email уже существует',
        status: false,
      },
    },
  })
  async requestVerificationCode(@Body() body: RegisterDto) {
    await this.authService.saveUserData(body);
    return { message: 'Код отправлен на почту', status: true };
  }

  /**
   * Конец регистрации: подтверждение кода и создание пользователя
   */
  @Post('registration-code')
  @ApiOperation({ summary: 'Подтверждение кода и регистрация пользователя' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'ivan@example.com' },
        code: { type: 'string', example: '123456' },
      },
      required: ['email', 'code'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Регистрация успешна',
    schema: {
      example: {
        message: 'Регистрация успешна',
        user: {
          id: 1,
          email: 'ivan@example.com',
          name: 'Иван Иванов',
          login: 'ivanivanov',
          token: 'jwt.token.here',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Неверный код подтверждения или отсутствуют данные пользователя',
    schema: {
      example: {
        message: 'Неверный код подтверждения',
        status: false,
      },
    },
  })
  async registration(@Body() body: { email: string; code: string }) {
    const user = await this.authService.verifyAndRegisterUser(
      body.email,
      body.code,
    );
    return { message: 'Регистрация успешна', user };
  }

  /**
   * Проверка валидности JWT токена
   */
  @UseGuards(JwtAuthGuard)
  @Post('check-token')
  @ApiOperation({ summary: 'Проверка валидности JWT токена' })
  @ApiResponse({
    status: 200,
    description: 'Токен валиден, доступ разрешен',
    schema: {
      example: { message: 'Токен валиден, доступ разрешен', status: true },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не валиден или отсутствует',
  })
  checkToken() {
    return { message: 'Токен валиден, доступ разрешен', status: true };
  }

  /**
   * Авторизация пользователя и получение JWT токена
   */
  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя и получение JWT токена' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Авторизация успешна, токен выдан',
    schema: {
      example: {
        status: true,
        token: 'jwt.token.here',
        data: {
          id: 1,
          email: 'ivan@example.com',
          login: 'ivanivanov',
          name: 'Иван Иванов',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные учетные данные',
    schema: {
      example: {
        message: 'Неверный пароль',
        status: false,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
    schema: {
      example: {
        message: 'Пользователь не найден',
        status: false,
      },
    },
  })
  async login(@Body() body: LoginDto): Promise<{ token: string }> {
    return this.authService.login(body.loginOrEmail, body.password);
  }
  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @ApiOperation({ summary: 'Смена пароля с указанием старого пароля' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Пароль успешно изменён',
    schema: {
      example: {
        status: true,
        message: 'Пароль успешно изменён',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или старый пароль неверен',
    schema: {
      example: {
        status: false,
        message: 'Некорректный старый пароль',
      },
    },
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * Запрос на сброс пароля через email
   */
  @Post('request-reset-password')
  @ApiOperation({ summary: 'Запрос на сброс пароля через email' })
  @ApiBody({ type: RequestResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Код для сброса пароля отправлен на email',
    schema: {
      example: {
        status: true,
        message: 'Код для сброса пароля отправлен на email',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь с таким email не найден',
    schema: {
      example: {
        status: false,
        message: 'Пользователь с таким email не найден',
      },
    },
  })
  async requestResetPassword(
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
  ) {
    return this.authService.requestResetPassword(requestResetPasswordDto.email);
  }

  /**
   * Проверка кода подтверждения и выдача токена для сброса пароля
   */
  @Post('verify-reset-code')
  @ApiOperation({
    summary: 'Проверка кода подтверждения и выдача токена для сброса пароля',
  })
  @ApiBody({ type: VerifyResetCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Токен для сброса пароля успешно выдан',
    schema: {
      example: {
        status: true,
        message: 'Токен для сброса пароля выдан',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный код подтверждения или ошибки валидации',
    schema: {
      example: {
        status: false,
        message: 'Некорректный код подтверждения',
      },
    },
  })
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    const { email, code } = verifyResetCodeDto;
    const token = await this.authService.verifyResetCode(email, code);
    return {
      status: true,
      message: 'Токен для сброса пароля выдан',
      token,
    };
  }

  /**
   * Сброс пароля с использованием токена подтверждения
   */
  @Post('reset-password')
  @ApiOperation({
    summary: 'Сброс пароля с использованием токена подтверждения',
  })
  @ApiBody({ type: ResetPasswordWithTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Пароль успешно сброшен',
    schema: {
      example: {
        status: true,
        message: 'Пароль успешно сброшен',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный токен или другие ошибки',
    schema: {
      example: {
        status: false,
        message: 'Некорректный или истёкший токен',
      },
    },
  })
  async resetPasswordWithToken(
    @Body() resetPasswordWithTokenDto: ResetPasswordWithTokenDto,
  ) {
    return this.authService.resetPasswordWithToken(resetPasswordWithTokenDto);
  }
}
