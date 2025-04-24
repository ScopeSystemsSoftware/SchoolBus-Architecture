import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  
  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('SchoolBus Auth Service API')
    .setDescription('Authentication and Authorization service for the SchoolBus platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Authentication service is running on port ${port}`);
}

bootstrap();

