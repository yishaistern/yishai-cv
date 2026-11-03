// loadBaseCv(): your gitignored base-cv.<lang>.json wins over the demo CV.
// paths.ts reads CV_DB_PATH at import time, so it is set before the dynamic import.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { baseCv, baseCvHe, type CvData } from '@yishai-cv/shared';

describe('loadBaseCv', () => {
  let dir: string;
  let loadBaseCv: (language?: 'en' | 'he') => CvData;

  before(async () => {
    dir = mkdtempSync(join(tmpdir(), 'cv-base-'));
    process.env.CV_DB_PATH = join(dir, 'cv.db');
    ({ loadBaseCv } = await import('./base-cv.ts'));
  });

  after(() => rmSync(dir, { recursive: true, force: true }));

  it('falls back to the demo CV when there is no local file', () => {
    assert.deepEqual(loadBaseCv('en'), baseCv);
    assert.deepEqual(loadBaseCv('he'), baseCvHe);
  });

  it('uses base-cv.<lang>.json next to the database when it exists', () => {
    const mine: CvData = { ...baseCv, header: { ...baseCv.header, firstName: 'Local' } };
    writeFileSync(join(dir, 'base-cv.en.json'), JSON.stringify(mine));
    assert.equal(loadBaseCv('en').header.firstName, 'Local');
    assert.deepEqual(loadBaseCv('he'), baseCvHe); // only the language that has a file changes
  });

  it('reports which file is broken', () => {
    writeFileSync(join(dir, 'base-cv.he.json'), '{ not json');
    assert.throws(() => loadBaseCv('he'), /base-cv\.he\.json/);
  });
});
