import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigManager } from './infraestructure/config/config-manager';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { GlobalLogger } from './shared/logger/service/global-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = new GlobalLogger();
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Company API challenge')
    .setDescription('API challenge for IT Patagonia')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = ConfigManager.getNumber('PORT', 3000);
  await app.listen(port);
  logger.log(`App running on http://localhost:${port}`, 'Main');
}
bootstrap();
