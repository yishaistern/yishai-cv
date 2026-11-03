import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, errorMessage } from './api.ts';

function mockFetch(impl: () => Promise<Response>) {
  const fn = vi.fn<typeof fetch>(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api', () => {
  it('sends JSON bodies and parses JSON responses', async () => {
    const fetchFn = mockFetch(async () => Response.json({ id: 7, name: 'X' }, { status: 201 }));
    const created = await api.createVersion({ name: 'X' });
    expect(created).toEqual({ id: 7, name: 'X' });
    expect(fetchFn).toHaveBeenCalledWith('/api/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X' }),
    });
  });

  it("surfaces the server's { error } message", async () => {
    mockFetch(async () => Response.json({ error: 'Version 9 not found' }, { status: 404 }));
    const err = await api.getVersion(9).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 404, message: 'Version 9 not found' });
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    mockFetch(async () => new Response('Bad Gateway', { status: 502 }));
    await expect(api.listVersions()).rejects.toThrow('GET /api/versions failed with HTTP 502');
  });

  it('reports network failures with status 0', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(api.listVersions()).rejects.toMatchObject({ status: 0 });
  });

  it('returns undefined for 204 No Content', async () => {
    mockFetch(async () => new Response(null, { status: 204 }));
    await expect(api.deleteVersion(1)).resolves.toBeUndefined();
  });
});

describe('errorMessage', () => {
  it('handles Errors and anything else', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
    expect(errorMessage('plain')).toBe('plain');
  });
});
