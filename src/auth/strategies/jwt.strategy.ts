import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from './jwt-payload.interface'; // создайте интерфейс для payload

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY, // или используйте переменные окружения
    });
  }

  async validate(payload: JwtPayload) {
    return this.authService.validateUser(payload); // метод для валидации пользователя
  }
}
