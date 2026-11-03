import { Injectable, NotFoundException } from '@nestjs/common';
import { type CvData, type Revision, type RevisionSummary, type Version, type VersionSummary } from '@yishai-cv/shared';
import { loadBaseCv } from '../database/base-cv.ts';
import { CvRepository } from '../database/cv.repository.ts';
import type { CreateVersionDto, UpdateVersionDto } from './versions.dto.ts';

/** Business rules on top of CvRepository; turns "not found" into 404s. */
@Injectable()
export class VersionsService {
  constructor(private readonly repo: CvRepository) {}

  list(): VersionSummary[] {
    return this.repo.listVersions();
  }

  get(id: number): Version {
    const version = this.repo.getVersion(id);
    if (!version) throw new NotFoundException(`Version ${id} not found`);
    return version;
  }

  create({ fromVersionId, language, ...meta }: CreateVersionDto): Version {
    // Start from an existing version's data, or from the (English or Hebrew) base CV.
    let data: CvData = loadBaseCv(language === 'he' ? 'he' : 'en');
    let note = language === 'he' ? 'Created from Base CV (Hebrew)' : 'Created from Base CV';
    if (fromVersionId !== undefined) {
      const source = this.get(fromVersionId);
      data = source.data;
      note = `Duplicated from #${fromVersionId} (${source.name})`;
    }
    return this.repo.createVersion({ ...meta, data, note });
  }

  update(id: number, patch: UpdateVersionDto): Version {
    const version = this.repo.updateVersion(id, patch);
    if (!version) throw new NotFoundException(`Version ${id} not found`);
    return version;
  }

  delete(id: number): void {
    if (!this.repo.deleteVersion(id)) throw new NotFoundException(`Version ${id} not found`);
  }

  listRevisions(versionId: number): RevisionSummary[] {
    this.get(versionId); // 404 if the version is missing
    return this.repo.listRevisions(versionId);
  }

  getRevision(id: number): Revision {
    const revision = this.repo.getRevision(id);
    if (!revision) throw new NotFoundException(`Revision ${id} not found`);
    return revision;
  }

  restore(versionId: number, revisionId: number): Version {
    this.get(versionId);
    const version = this.repo.restoreRevision(versionId, revisionId);
    if (!version) throw new NotFoundException(`Revision ${revisionId} not found for version ${versionId}`);
    return version;
  }
}
