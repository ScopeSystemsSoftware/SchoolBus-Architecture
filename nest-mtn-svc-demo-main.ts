import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  // Creare instanță aplicație NestJS
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Logger personalizat
  app.useLogger(app.get(Logger));

  // Global prefix pentru toate rutele API
  app.setGlobalPrefix('api');

  // Activare validare pipe globală
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Middleware securitate
  app.use(helmet());

  // Configurare CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configurare și inițializare Swagger
  const config = new DocumentBuilder()
    .setTitle('SchoolBus Multi-Tenant API')
    .setDescription('API pentru demonstrarea funcționalităților multi-tenant pentru platforma SchoolBus')
    .setVersion('1.0')
    .addTag('schools', 'Operațiuni pentru gestionarea școlilor')
    .addTag('students', 'Operațiuni pentru gestionarea elevilor')
    .addTag('health', 'Endpoint-uri pentru verificarea stării serviciului')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Pornire server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicația rulează pe portul: ${port}`);
}

bootstrap(); 