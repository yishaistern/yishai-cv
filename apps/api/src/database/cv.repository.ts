// SQLite storage for CV versions and their revision history.
// Uses Node's built-in `node:sqlite` module (no native npm package needed).
// All methods are synchronous: SQLite is a local file, so queries are fast and
// there is no network round-trip worth awaiting.
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { type CvData, type Revision, type RevisionSummary, type Version, type VersionSummary } from '@yishai-cv/shared';
import { DB_PATH } from '../paths.ts';
import { loadBaseCv } from './base-cv.ts';

// ---------- Row types (what SQLite gives back: snake_case, JSON as text) ----------

interface VersionRow {
  id: number;
  name: string;
  description: string;
  target_company: string;
  target_role: string;
  data: string;
  created_at: string;
  updated_at: string;
}

interface RevisionRow {
  id: number;
  version_id: number;
  data: string;
  note: string;
  created_at: string;
}

const toVersionSummary = (r: VersionRow): VersionSummary => ({
  id: r.id,
  name: r.name,
  description: r.description,
  targetCompany: r.target_company,
  targetRole: r.target_role,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toVersion = (r: VersionRow): Version => ({ ...toVersionSummary(r), data: JSON.parse(r.data) as CvData });

const toRevisionSummary = (r: RevisionRow): RevisionSummary => ({
  id: r.id,
  versionId: r.version_id,
  note: r.note,
  createdAt: r.created_at,
});

const toRevision = (r: RevisionRow): Revision => ({ ...toRevisionSummary(r), data: JSON.parse(r.data) as CvData });

const now = () => new Date().toISOString();

export interface NewVersion {
  name: string;
  description?: string;
  targetCompany?: string;
  targetRole?: string;
  data: CvData;
  note?: string; // note for the first revision
}

export interface VersionPatch {
  name?: string;
  description?: string;
  targetCompany?: string;
  targetRole?: string;
  data?: CvData;
  note?: string;
}

export const BASE_VERSION_NAME = 'Base CV';
export const BASE_VERSION_NAME_HE = 'Base CV (Hebrew)';

@Injectable()
export class CvRepository implements OnModuleInit, OnModuleDestroy {
  private readonly db: DatabaseSync;
  private readonly stmt: Record<
    | 'listVersions'
    | 'getVersion'
    | 'insertVersion'
    | 'updateVersion'
    | 'deleteVersion'
    | 'listRevisions'
    | 'getRevision'
    | 'setVersionData'
    | 'insertRevision',
    StatementSync
  >;

  constructor() {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    this.db = new DatabaseSync(DB_PATH);

    // SQLite ignores foreign keys unless you turn them on per connection.
    // Without this, ON DELETE CASCADE on revisions would silently do nothing.
    this.db.exec('PRAGMA foreign_keys = ON');
    // WAL ("write-ahead log") mode: readers don't block writers, and writes are faster.
    this.db.exec('PRAGMA journal_mode = WAL');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS versions (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT NOT NULL,
        description    TEXT NOT NULL DEFAULT '',
        target_company TEXT NOT NULL DEFAULT '',
        target_role    TEXT NOT NULL DEFAULT '',
        data           TEXT NOT NULL, -- CvData as JSON
        created_at     TEXT NOT NULL,
        updated_at     TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS revisions (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
        data       TEXT NOT NULL, -- CvData as JSON (a full snapshot, not a diff)
        note       TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_revisions_version ON revisions(version_id);
    `);

    // Prepared statements: parsed once, reused on every call.
    this.stmt = {
      listVersions: this.db.prepare('SELECT * FROM versions ORDER BY updated_at DESC, id DESC'),
      getVersion: this.db.prepare('SELECT * FROM versions WHERE id = ?'),
      insertVersion: this.db.prepare(`
        INSERT INTO versions (name, description, target_company, target_role, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`),
      updateVersion: this.db.prepare(`
        UPDATE versions
        SET name = ?, description = ?, target_company = ?, target_role = ?, data = ?, updated_at = ?
        WHERE id = ?`),
      deleteVersion: this.db.prepare('DELETE FROM versions WHERE id = ?'),
      listRevisions: this.db.prepare(
        'SELECT id, version_id, note, created_at FROM revisions WHERE version_id = ? ORDER BY id DESC',
      ),
      getRevision: this.db.prepare('SELECT * FROM revisions WHERE id = ?'),
      setVersionData: this.db.prepare('UPDATE versions SET data = ?, updated_at = ? WHERE id = ?'),
      insertRevision: this.db.prepare('INSERT INTO revisions (version_id, data, note, created_at) VALUES (?, ?, ?, ?)'),
    };
  }

  /** First run: an empty database gets the base CVs so the dashboard has something to show. */
  onModuleInit(): void {
    const { count } = this.db.prepare('SELECT COUNT(*) AS count FROM versions').get() as { count: number };
    if (count === 0) {
      this.insertBaseVersion();
      this.insertHebrewBaseVersion();
    }
  }

  onModuleDestroy(): void {
    this.db.close();
  }

  /**
   * Run `fn` inside a transaction: either every write in it is saved, or none are.
   * Used whenever we write a version AND a revision, so a crash halfway can never
   * leave a version whose history is missing its latest save.
   */
  private transaction<T>(fn: () => T): T {
    this.db.exec('BEGIN');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  // node:sqlite returns generic row objects; we cast them to our row interfaces.
  private versionRow(id: number): VersionRow | undefined {
    return this.stmt.getVersion.get(id) as unknown as VersionRow | undefined;
  }

  private revisionRow(id: number): RevisionRow | undefined {
    return this.stmt.getRevision.get(id) as unknown as RevisionRow | undefined;
  }

  // ---------- Versions ----------

  listVersions(): VersionSummary[] {
    return (this.stmt.listVersions.all() as unknown as VersionRow[]).map(toVersionSummary);
  }

  getVersion(id: number): Version | undefined {
    const row = this.versionRow(id);
    return row && toVersion(row);
  }

  /** Insert a version plus its first revision, atomically. */
  createVersion(v: NewVersion): Version {
    const json = JSON.stringify(v.data);
    const ts = now();
    const id = this.transaction(() => {
      const { lastInsertRowid } = this.stmt.insertVersion.run(
        v.name,
        v.description ?? '',
        v.targetCompany ?? '',
        v.targetRole ?? '',
        json,
        ts,
        ts,
      );
      const versionId = Number(lastInsertRowid);
      this.stmt.insertRevision.run(versionId, json, v.note ?? 'Created', ts);
      return versionId;
    });
    return this.getVersion(id)!;
  }

  /**
   * Update metadata and/or data. A revision is written only when `data` is given
   * AND actually differs from what's stored (so a plain "Save" with no edits doesn't
   * spam the history). Returns undefined if the version doesn't exist.
   */
  updateVersion(id: number, patch: VersionPatch): Version | undefined {
    const row = this.versionRow(id);
    if (!row) return undefined;

    const newJson = patch.data !== undefined ? JSON.stringify(patch.data) : row.data;
    const dataChanged = newJson !== row.data;
    const ts = now();

    this.transaction(() => {
      this.stmt.updateVersion.run(
        patch.name ?? row.name,
        patch.description ?? row.description,
        patch.targetCompany ?? row.target_company,
        patch.targetRole ?? row.target_role,
        newJson,
        ts,
        id,
      );
      if (dataChanged) this.stmt.insertRevision.run(id, newJson, patch.note ?? '', ts);
    });
    return this.getVersion(id);
  }

  /** Returns true if a row was deleted. Revisions go with it (ON DELETE CASCADE). */
  deleteVersion(id: number): boolean {
    return Number(this.stmt.deleteVersion.run(id).changes) > 0;
  }

  // ---------- Revisions ----------

  listRevisions(versionId: number): RevisionSummary[] {
    return (this.stmt.listRevisions.all(versionId) as unknown as RevisionRow[]).map(toRevisionSummary);
  }

  getRevision(id: number): Revision | undefined {
    const row = this.revisionRow(id);
    return row && toRevision(row);
  }

  /**
   * Copy a past revision's data back into its version, and record that as a new
   * revision ("Restored from #N") so the restore itself can be undone.
   * Returns undefined if the version or revision is missing, or the revision
   * belongs to a different version.
   */
  restoreRevision(versionId: number, revisionId: number): Version | undefined {
    const rev = this.revisionRow(revisionId);
    if (!rev || rev.version_id !== versionId || !this.versionRow(versionId)) return undefined;

    const ts = now();
    this.transaction(() => {
      this.stmt.setVersionData.run(rev.data, ts, versionId);
      this.stmt.insertRevision.run(versionId, rev.data, `Restored from #${revisionId}`, ts);
    });
    return this.getVersion(versionId);
  }

  // ---------- Seeding ----------

  insertBaseVersion(): Version {
    return this.createVersion({
      name: BASE_VERSION_NAME,
      description: 'Master version: every other version starts from this',
      data: loadBaseCv('en'),
      note: 'Initial import',
    });
  }

  insertHebrewBaseVersion(): Version {
    return this.createVersion({
      name: BASE_VERSION_NAME_HE,
      description: 'Hebrew translation of the Base CV (right-to-left layout)',
      data: loadBaseCv('he'),
      note: 'Initial import (Hebrew)',
    });
  }

  /** Delete every row and reset the AUTOINCREMENT counters so ids start at 1 again. */
  resetDatabase(): { versions: number; revisions: number } {
    return this.transaction(() => {
      const revisions = Number(this.db.prepare('DELETE FROM revisions').run().changes);
      const versions = Number(this.db.prepare('DELETE FROM versions').run().changes);
      // sqlite_sequence is SQLite's internal table that tracks AUTOINCREMENT ids.
      this.db.exec("DELETE FROM sqlite_sequence WHERE name IN ('versions', 'revisions')");
      return { versions, revisions };
    });
  }
}
