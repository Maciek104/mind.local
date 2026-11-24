
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import cookieParser from 'cookie-parser';

import { setupEnvironment } from './config/env.setup.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  setupEnvironment();

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);

  console.log('Backend running at http://localhost:3000');
}

bootstrap();
