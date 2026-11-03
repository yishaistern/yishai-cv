// REST routes; the contract is documented in libs/shared/src/types.ts.
// All paths get the global "/api" prefix (see main.ts).
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import type { Revision, RevisionSummary, Version, VersionSummary } from '@yishai-cv/shared';
import { ParseIdPipe } from '../common/parse-id.pipe.ts';
import { CreateVersionDto, UpdateVersionDto } from './versions.dto.ts';
import { VersionsService } from './versions.service.ts';

@Controller('versions')
export class VersionsController {
  constructor(private readonly versions: VersionsService) {}

  @Get()
  list(): VersionSummary[] {
    return this.versions.list();
  }

  @Get(':id')
  get(@Param('id', ParseIdPipe) id: number): Version {
    return this.versions.get(id);
  }

  @Post() // 201 by default
  create(@Body() body: CreateVersionDto): Version {
    return this.versions.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIdPipe) id: number, @Body() body: UpdateVersionDto): Version {
    return this.versions.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIdPipe) id: number): void {
    this.versions.delete(id);
  }

  @Get(':id/revisions')
  listRevisions(@Param('id', ParseIdPipe) id: number): RevisionSummary[] {
    return this.versions.listRevisions(id);
  }

  @Post(':id/restore/:revisionId')
  @HttpCode(200)
  restore(@Param('id', ParseIdPipe) id: number, @Param('revisionId', ParseIdPipe) revisionId: number): Version {
    return this.versions.restore(id, revisionId);
  }
}

@Controller('revisions')
export class RevisionsController {
  constructor(private readonly versions: VersionsService) {}

  @Get(':id')
  get(@Param('id', ParseIdPipe) id: number): Revision {
    return this.versions.getRevision(id);
  }
}
