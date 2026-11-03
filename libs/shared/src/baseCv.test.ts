// Sanity checks on the seed data. Run with `npx nx test shared`
// (Node runs this .ts file directly, no build step needed).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { baseCv, baseCvHe, type CvData } from './index.ts';

/** Every id in a CV: React keys and drag & drop rely on them being unique. */
function allIds(cv: CvData): string[] {
  return [
    ...cv.skills.map((s) => s.id),
    ...cv.languages.map((l) => l.id),
    ...cv.strengths.map((s) => s.id),
    ...cv.jobs.flatMap((j) => [j.id, ...j.groups.flatMap((g) => [g.id, ...g.bullets.map((b) => b.id)])]),
  ];
}

for (const [name, cv] of [['baseCv', baseCv], ['baseCvHe', baseCvHe]] as const) {
  describe(name, () => {
    it('has unique ids', () => {
      const ids = allIds(cv);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      assert.deepEqual(duplicates, []);
    });

    it('has the required content', () => {
      assert.ok(cv.header.firstName && cv.header.lastName);
      assert.ok(cv.summary.length > 0);
      assert.ok(cv.jobs.length > 0 && cv.skills.length > 0);
    });

    it('only references logos that exist in <repo>/images', () => {
      for (const job of cv.jobs) {
        if (!job.logo) continue;
        assert.match(job.logo, /^images\/[\w.-]+$/);
        assert.ok(existsSync(new URL(`../../../${job.logo}`, import.meta.url)), `missing ${job.logo}`);
      }
    });
  });
}

describe('language', () => {
  it('marks the Hebrew base CV as Hebrew', () => {
    assert.equal(baseCvHe.language, 'he');
    assert.notEqual(baseCv.language, 'he');
  });
});
