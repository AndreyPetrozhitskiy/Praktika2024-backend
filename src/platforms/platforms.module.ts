// src/platforms/platforms.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { PlatformsController } from './platforms.controller';
import { PlatformsService } from './platforms.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlatformsController],
  providers: [PlatformsService],
})
export class PlatformsModule {}
