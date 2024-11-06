import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super(); // Инициализация PrismaClient
  }

  // Метод, который будет вызываться при завершении работы модуля
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
