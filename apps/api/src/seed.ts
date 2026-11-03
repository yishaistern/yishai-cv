// Reset the database to a clean state containing only the Base CV.
// Run with `npm run seed` from the repo root. WARNING: deletes every version and revision.
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CvRepository } from './database/cv.repository.ts';
import { DatabaseModule } from './database/database.module.ts';

const app = await NestFactory.createApplicationContext(DatabaseModule, { logger: ['error', 'warn'] });
const repo = app.get(CvRepository);

const removed = repo.resetDatabase();
console.log(`Deleted ${removed.versions} version(s) and ${removed.revisions} revision(s).`);

const base = repo.insertBaseVersion();
console.log(`Inserted "${base.name}" as version #${base.id} (${base.data.jobs.length} jobs, ${base.data.skills.length} skills).`);

await app.close();
