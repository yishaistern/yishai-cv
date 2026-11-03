import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.ts';
import { VersionsModule } from './versions/versions.module.ts';

@Module({
  imports: [DatabaseModule, VersionsModule],
})
export class AppModule {}
