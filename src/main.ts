import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Применение глобального валидационного пайпа
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, не описанные в DTO
      forbidNonWhitelisted: true, // Генерирует ошибку, если присутствуют лишние свойства
      transform: true, // Преобразует входящие данные к типам, указанным в DTO
    }),
  );

  // Применение глобального фильтра исключений
  app.useGlobalFilters(new AllExceptionsFilter());
  const config = new DocumentBuilder()
    .setTitle('Документация для Petcher  API (NestJS)')
    .setDescription('ещкере')
    .setVersion('1.0')
    .addBearerAuth() // Добавление поддержки JWT-аутентификации
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  console.log(process.env.PORT);
  await app.listen(process.env.PORT);
}
bootstrap();
