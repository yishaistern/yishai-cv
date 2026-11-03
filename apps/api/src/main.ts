// NestJS API for the CV dashboard. Run with `npm run dev` from the repo root
// (or `npx nx dev api`); it rebuilds and restarts on every change.
import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { Logger, type NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.ts';
import { ApiExceptionFilter } from './common/api-exception.filter.ts';
import { BodyValidationPipe } from './common/body-validation.pipe.ts';
import { IMAGES_DIR, WEB_DIST_DIR } from './paths.ts';

/** Builds the configured app without listening, so tests can start it on a random port. */
export async function createApp(options?: NestApplicationOptions): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, options);

  app.useBodyParser('json', { limit: '2mb' }); // CV JSON is small, but leave headroom
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new BodyValidationPipe()); // validates DTOs, see versions.dto.ts
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks(); // closes the SQLite connection on Ctrl+C

  // Logos referenced as "images/zoominfo.png" in the CV data.
  app.useStaticAssets(IMAGES_DIR, { prefix: '/images/' });

  // Production: serve the built React app too, so `npm start` is a single process.
  // In development Vite serves the app on :5173 and proxies /api here instead.
  if (existsSync(WEB_DIST_DIR)) app.useStaticAssets(WEB_DIST_DIR);

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT) || 3001;
  // The API has no authentication, so listen on loopback only by default.
  // Set HOST=0.0.0.0 to expose it on your network on purpose.
  const host = process.env.HOST ?? '127.0.0.1';
  await app.listen(port, host);
  Logger.log(`CV API listening on http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`, 'Bootstrap');
}

// Start the server only when run directly (`node dist/main.js`), not when tests import createApp().
if (import.meta.main) void bootstrap();
