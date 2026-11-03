// End-to-end tests for the REST contract in libs/shared/src/types.ts.
// They boot the real Nest app (pipes, filter, SQLite) on a random port against an
// in-memory database, then talk to it over HTTP like the web app does.
// Run with `npx nx test api` (compiles with tsc, then runs `node --test` on dist/).
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { CvData, RevisionSummary, Version, VersionSummary } from '@yishai-cv/shared';

let app: NestExpressApplication;
let baseUrl: string;

before(async () => {
  // Must be set before paths.ts is evaluated, hence the dynamic import below.
  process.env.CV_DB_PATH = ':memory:';
  const { createApp } = await import('../main.ts');
  app = await createApp({ logger: false });
  await app.listen(0, '127.0.0.1');
  baseUrl = await app.getUrl();
});

after(async () => {
  await app?.close();
});

async function call<T = unknown>(method: string, path: string, body?: unknown): Promise<{ status: number; body: T }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: (text ? JSON.parse(text) : undefined) as T };
}

describe('versions API', () => {
  it('seeds the English and Hebrew base CVs on first start', async () => {
    const { status, body } = await call<VersionSummary[]>('GET', '/api/versions');
    assert.equal(status, 200);
    assert.deepEqual(body.map((v) => v.name).toSorted(), ['Base CV', 'Base CV (Hebrew)']);
    assert.ok(!('data' in body[0]!), 'the list must not include the CV data');
  });

  it('creates a version from the Hebrew base CV, with a first revision', async () => {
    const { status, body } = await call<Version>('POST', '/api/versions', { name: '  Acme  ', language: 'he' });
    assert.equal(status, 201);
    assert.equal(body.name, 'Acme', 'name is trimmed');
    assert.equal(body.data.language, 'he');

    const history = await call<RevisionSummary[]>('GET', `/api/versions/${body.id}/revisions`);
    assert.deepEqual(
      history.body.map((r) => r.note),
      ['Created from Base CV (Hebrew)'],
    );
  });

  it('duplicates an existing version', async () => {
    const source = await call<Version>('POST', '/api/versions', { name: 'Source' });
    await call('PUT', `/api/versions/${source.body.id}`, {
      data: { ...source.body.data, summary: 'Tailored summary' },
    });

    const copy = await call<Version>('POST', '/api/versions', { name: 'Copy', fromVersionId: source.body.id });
    assert.equal(copy.status, 201);
    assert.equal(copy.body.data.summary, 'Tailored summary');
  });

  it('records a revision only when the CV data actually changes', async () => {
    const { body: v } = await call<Version>('POST', '/api/versions', { name: 'Revisions' });
    const revisions = async () => (await call<RevisionSummary[]>('GET', `/api/versions/${v.id}/revisions`)).body;

    // Meta-only update: no new revision.
    const renamed = await call<Version>('PUT', `/api/versions/${v.id}`, { targetCompany: 'Acme' });
    assert.equal(renamed.body.targetCompany, 'Acme');
    assert.equal((await revisions()).length, 1);

    // Same data again: no new revision.
    await call('PUT', `/api/versions/${v.id}`, { data: v.data, note: 'no-op' });
    assert.equal((await revisions()).length, 1);

    // Changed data: new revision with the note, newest first.
    const data: CvData = { ...v.data, summary: 'Changed' };
    await call('PUT', `/api/versions/${v.id}`, { data, note: 'shorter summary' });
    const list = await revisions();
    assert.equal(list.length, 2);
    assert.equal(list[0]!.note, 'shorter summary');
  });

  it('restores a past revision as a new revision', async () => {
    const { body: v } = await call<Version>('POST', '/api/versions', { name: 'Restore' });
    const [first] = (await call<RevisionSummary[]>('GET', `/api/versions/${v.id}/revisions`)).body;
    await call('PUT', `/api/versions/${v.id}`, { data: { ...v.data, summary: 'Edited' } });

    const restored = await call<Version>('POST', `/api/versions/${v.id}/restore/${first!.id}`);
    assert.equal(restored.status, 200);
    assert.equal(restored.body.data.summary, v.data.summary);

    const list = (await call<RevisionSummary[]>('GET', `/api/versions/${v.id}/revisions`)).body;
    assert.equal(list[0]!.note, `Restored from #${first!.id}`);
  });

  it("refuses to restore another version's revision", async () => {
    const a = (await call<Version>('POST', '/api/versions', { name: 'A' })).body;
    const b = (await call<Version>('POST', '/api/versions', { name: 'B' })).body;
    const [revOfB] = (await call<RevisionSummary[]>('GET', `/api/versions/${b.id}/revisions`)).body;

    const res = await call<{ error: string }>('POST', `/api/versions/${a.id}/restore/${revOfB!.id}`);
    assert.equal(res.status, 404);
  });

  it('deletes a version together with its revisions', async () => {
    const { body: v } = await call<Version>('POST', '/api/versions', { name: 'Doomed' });
    const [rev] = (await call<RevisionSummary[]>('GET', `/api/versions/${v.id}/revisions`)).body;

    assert.equal((await call('DELETE', `/api/versions/${v.id}`)).status, 204);
    assert.equal((await call('GET', `/api/versions/${v.id}`)).status, 404);
    assert.equal((await call('GET', `/api/revisions/${rev!.id}`)).status, 404);
  });
});

describe('errors', () => {
  it('rejects a missing name with a { error } body', async () => {
    const res = await call<{ error: string }>('POST', '/api/versions', { name: '   ' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /"name" is required/);
  });

  it('rejects an unknown language', async () => {
    const res = await call<{ error: string }>('POST', '/api/versions', { name: 'X', language: 'fr' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /"language" must be one of/);
  });

  it('rejects malformed CV data', async () => {
    const res = await call<{ error: string }>('PUT', '/api/versions/1', { data: { summary: 'only this' } });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /not a valid CvData/);
  });

  it('rejects non-numeric ids and reports unknown ones as 404', async () => {
    assert.equal((await call('GET', '/api/versions/abc')).status, 400);
    assert.equal((await call('GET', '/api/versions/0')).status, 400);

    const missing = await call<{ error: string }>('GET', '/api/versions/99999');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error, 'Version 99999 not found');
  });
});
