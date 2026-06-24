import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix so all routes are /api/projects, /api/projects/:id/assets etc.
  app.setGlobalPrefix('api');

  // ValidationPipe activates the class-validator decorators on our DTOs.
  // Without this, @IsString(), @IsUrl() etc. do nothing.
  // whitelist: true strips any properties not in the DTO (prevents extra fields sneaking in).
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Serve uploaded files as static assets under /uploads/*
  // This is what makes file URLs like /uploads/123-photo.png work in the browser.
  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve('./uploads');
  app.use('/uploads', express.static(uploadDir));

  // Allow the React frontend (running on a different port in dev) to call this API
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
}

bootstrap();