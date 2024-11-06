import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
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
  // Генерация кода
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // шестизначный код
  }
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      return null;
    }

    return user;
  }
  // Сохранение кода
  async saveCode(email: string, code: string): Promise<void> {
    await this.redis.set(email, code, 'EX', 300); // Сохраняем код с временем жизни 5 минут
  }
  // Верефикация кода
  async verifyCode(email: string, code: string): Promise<boolean> {
    const savedCode = await this.redis.get(email);
    return savedCode === code;
  }
  // Сохранение данных о юзере и отправка кода
  async saveUserData(registerDto: RegisterDto): Promise<void> {
    const { email, name, login, password } = registerDto;
    // console.log('Получили данные из запроса');

    // Проверка существования пользователя с таким email
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException({
        message: 'Пользователь с таким email уже существует',
        status: false,
      });
    }

    // Проверка существования пользователя с таким login
    const existingUserByLogin = await this.prisma.user.findUnique({
      where: { login },
    });
    if (existingUserByLogin) {
      throw new ConflictException({
        message: 'Пользователь с таким логином уже существует',
        status: false,
      });
    }

    // Убедимся, что в Redis нет данных о пользователе
    const userType = await this.redis.type(`user:${email}`);
    if (userType !== 'none' && userType !== 'hash') {
      await this.redis.del(`user:${email}`);
    }

    // Сохраняем данные пользователя как хеш
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.redis.hset(
      `user:${email}`,
      'name',
      name,
      'login',
      login,
      'password',
      hashedPassword,
    );
    // console.log('Сохранили в редис данные пользователя');

    const code = this.generateCode();
    // console.log('Создали код');

    // Сохраняем код в отдельном ключе
    await this.saveCode(email, code);
    // console.log('Сохранили код в редис');

    await this.mailerService.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Регистрационный код',
      html: emailTemplate(code),
    });
  }
  // Итоговая регистрация
  async verifyAndRegisterUser(email: string, code: string): Promise<any> {
    const isCodeValid = await this.verifyCode(email, code);
    if (!isCodeValid) {
      throw new BadRequestException({
        message: 'Неверный код подтверждения',
        status: false,
      });
    }

    const userData = await this.redis.hgetall(`user:${email}`);
    // console.log('Данные пользователя:', userData);
    if (!userData) {
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

  // // Авторизация
  async login(loginOrEmail: string, password: string): Promise<any> {
    // Проверяем, если это email или login
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

    // Проверьте пароль (сравнение пароля с хэшированным)
    // Проверяем пароль с хешированным в базе
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        message: 'Неверный пароль',
        status: false,
      });
    }

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
  // // Выдать роль
  // getRole(): string {
  //   return 'выдать роль';
  // }
  // // Выдать навык
  // getSkill(): string {
  //   return 'выдать навык';
  // }
}
