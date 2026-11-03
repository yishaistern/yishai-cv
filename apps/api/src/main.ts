// NestJS API for the CV dashboard. Run with `npm run dev` from the repo root
// (or `npx nx dev api`); it rebuilds and restarts on every change.
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.ts';
import { ApiExceptionFilter } from './common/api-exception.filter.ts';
import { BodyValidationPipe } from './common/body-validation.pipe.ts';
import { IMAGES_DIR } from './paths.ts';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser('json', { limit: '2mb' }); // CV JSON is small, but leave headroom
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new BodyValidationPipe()); // validates DTOs, see versions.dto.ts
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks(); // closes the SQLite connection on Ctrl+C

  // Logos referenced as "images/zoominfo.png" in the CV data.
  app.useStaticAssets(IMAGES_DIR, { prefix: '/images/' });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  Logger.log(`CV API listening on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
