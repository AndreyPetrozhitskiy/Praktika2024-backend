// src/auth/auth.service.ts

import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordWithTokenDto } from './dto/reset-password-with-token.dto';
import { JwtPayload } from './strategies/jwt-payload.interface';
import { emailTemplate } from './templates/email.template';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Генерация шестизначного кода
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Валидация пользователя по payload JWT
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  // Сохранение кода подтверждения в Redis
  async saveCode(email: string, code: string): Promise<void> {
    await this.redis.set(email, code, 'EX', 300); // 5 минут
  }

  // Верификация кода подтверждения
  async verifyCode(email: string, code: string): Promise<boolean> {
    const savedCode = await this.redis.get(email);
    return savedCode === code;
  }

  // Сохранение данных о пользователе и отправка кода подтверждения
  async saveUserData(registerDto: RegisterDto): Promise<void> {
    const { email, name, login, password } = registerDto;

    // Проверка существования пользователя по email
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException({
        message: 'Пользователь с таким email уже существует',
        status: false,
      });
    }

    // Проверка существования пользователя по логину
    const existingUserByLogin = await this.prisma.user.findUnique({
      where: { login },
    });
    if (existingUserByLogin) {
      throw new ConflictException({
        message: 'Пользователь с таким логином уже существует',
        status: false,
      });
    }

    // Очистка Redis от предыдущих данных пользователя (если есть)
    const userType = await this.redis.type(`user:${email}`);
    if (userType !== 'none' && userType !== 'hash') {
      await this.redis.del(`user:${email}`);
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохранение данных пользователя в Redis как хеш
    await this.redis.hset(
      `user:${email}`,
      'name',
      name,
      'login',
      login,
      'password',
      hashedPassword,
    );

    // Генерация и сохранение кода подтверждения
    const code = this.generateCode();
    await this.saveCode(email, code);

    // Отправка письма с кодом подтверждения
    await this.mailerService.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Регистрационный код',
      html: emailTemplate(code),
    });
  }

  // Верификация кода и регистрация пользователя
  async verifyAndRegisterUser(
    email: string,
    code: string,
  ): Promise<{ user: any; token: string }> {
    const isCodeValid = await this.verifyCode(email, code);
    if (!isCodeValid) {
      throw new BadRequestException({
        message: 'Неверный код подтверждения',
        status: false,
      });
    }

    const userData = await this.redis.hgetall(`user:${email}`);
    if (!userData || Object.keys(userData).length === 0) {
      throw new BadRequestException({
        message: 'Нет данных пользователя',
        status: false,
      });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException({
        message: 'Пользователь с таким email уже существует',
        status: false,
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        password: userData.password,
        name: userData.name,
        login: userData.login,
      },
    });

    // Генерация JWT токена после успешной регистрации
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  // Авторизация пользователя и выдача JWT токена
  async login(
    loginOrEmail: string,
    password: string,
  ): Promise<{
    status: boolean;
    token: string;
    data: { id: number; email: string; login: string; name: string };
  }> {
    // Поиск пользователя по email или логину
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: loginOrEmail }, { login: loginOrEmail }],
      },
    });

    if (!user) {
      throw new BadRequestException({
        message: 'Пользователь не найден',
        status: false,
      });
    }

    // Проверка валидности пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        message: 'Неверный пароль',
        status: false,
      });
    }

    // Генерация JWT токена
    const payload: JwtPayload = { email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      status: true,
      token: access_token,
      data: {
        id: user.id,
        email: user.email,
        login: user.login,
        name: user.name,
      },
    };
  }
  /**
   * Смена пароля с указанием старого пароля
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    // Получаем пользователя из базы данных
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        status: false,
        message: 'Пользователь не найден',
      });
    }

    // Сравниваем старый пароль
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException({
        status: false,
        message: 'Некорректный старый пароль',
      });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль в базе данных
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      status: true,
      message: 'Пароль успешно изменён',
    };
  }

  /**
   * Запрос на сброс пароля через email
   */
  async requestResetPassword(email: string) {
    // Проверяем, существует ли пользователь с таким email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException({
        status: false,
        message: 'Пользователь с таким email не найден',
      });
    }

    // Генерируем код подтверждения
    const code = this.generateCode();

    // Сохраняем код в Redis с временем жизни 10 минут
    await this.redis.set(`reset:code:${email}`, code, 'EX', 600); // 10 минут

    // Отправляем email с кодом подтверждения
    await this.mailerService.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Код для сброса пароля',
      html: emailTemplate(code),
    });

    return {
      status: true,
      message: 'Код для сброса пароля отправлен на email',
    };
  }

  /**
   * Проверка кода подтверждения и выдача токена для сброса пароля
   */
  async verifyResetCode(email: string, code: string): Promise<string> {
    // Получаем сохраненный код из Redis
    const savedCode = await this.redis.get(`reset:code:${email}`);

    if (!savedCode) {
      throw new BadRequestException({
        status: false,
        message: 'Код подтверждения не найден или истёк',
      });
    }

    if (savedCode !== code) {
      throw new BadRequestException({
        status: false,
        message: 'Некорректный код подтверждения',
      });
    }

    // Генерируем токен для сброса пароля
    const payload: JwtPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_RESET_PASSWORD_SECRET,
      expiresIn: '15m', // Токен действителен 15 минут
    });

    // Сохраняем токен в Redis с временем жизни 15 минут
    await this.redis.set(`reset:token:${token}`, email, 'EX', 900); // 15 минут

    // Удаляем код подтверждения из Redis
    await this.redis.del(`reset:code:${email}`);

    return token;
  }

  /**
   * Сброс пароля с использованием токена подтверждения
   */
  async resetPasswordWithToken(
    resetPasswordWithTokenDto: ResetPasswordWithTokenDto,
  ) {
    const { token, newPassword } = resetPasswordWithTokenDto;

    // Проверяем, существует ли токен в Redis
    const email = await this.redis.get(`reset:token:${token}`);

    if (!email) {
      throw new BadRequestException({
        status: false,
        message: 'Некорректный или истёкший токен',
      });
    }

    // Валидация токена
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      });

      if (payload.email !== email) {
        throw new BadRequestException({
          status: false,
          message: 'Некорректный токен',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        status: false,
        message: 'Некорректный или истёкший токен',
      });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль в базе данных
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Удаляем токен из Redis после успешного сброса
    await this.redis.del(`reset:token:${token}`);

    return {
      status: true,
      message: 'Пароль успешно сброшен',
    };
  }
}
