import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Импортируем PrismaService
import { AuthModule } from '../auth/auth.module'; // Импортируем AuthModule
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [AuthModule],
  controllers: [SkillsController],
  providers: [SkillsService, PrismaService],
})
export class SkillsModule {}
