import { Global, Module } from '@nestjs/common';
import { CvRepository } from './cv.repository.ts';

/** Provides the single SQLite-backed CvRepository to every module. */
@Global()
@Module({
  providers: [CvRepository],
  exports: [CvRepository],
})
export class DatabaseModule {}
