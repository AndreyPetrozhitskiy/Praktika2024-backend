import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { PlatformsModule } from './platforms/platforms.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делаем модуль доступным во всем приложении
    }),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379', // Adjust the URL to match your Redis server
    }),
    UsersModule,
    AuthModule,
    SkillsModule,
    PlatformsModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
