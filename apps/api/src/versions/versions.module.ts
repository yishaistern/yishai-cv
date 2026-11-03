import { Module } from '@nestjs/common';
import { RevisionsController, VersionsController } from './versions.controller.ts';
import { VersionsService } from './versions.service.ts';

@Module({
  controllers: [VersionsController, RevisionsController],
  providers: [VersionsService],
})
export class VersionsModule {}
