import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Load .env into process.env before any module reads it
const envPath = resolve(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const rawLine of envContent.split('\n')) {
    const trimmed = rawLine.replace(/\r$/, '').trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
} catch {
  // .env file not found
}

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disabled to allow Three.js / dynamic styles
  }));

  app.use(cookieParser());
  app.use(compression());

  // Cache static assets and public GET responses
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    }
    next();
  });

  app.enableShutdownHooks();

  // Request tracing — adds X-Request-Id header and logs method/url/status/duration
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = randomUUID().slice(0, 8);
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'log';
      app.get(Logger)[level](`[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
    credentials: true,
  });

  // Increase JSON body size limit
  const { json } = require('body-parser');
  app.use(json({ limit: '10mb' }));
  app.use((err: { type?: string }, _req: Request, res: Response, next: NextFunction) => {
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        statusCode: 413,
        message: [`Request body too large. Maximum size is 10MB`],
        error: 'PAYLOAD_TOO_LARGE',
      });
    }
    next(err);
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Class Memories API')
    .setDescription('班级时光馆 - 毕业班级数字记忆归档平台')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}
bootstrap();
