// ============================================================
// Tiny typed fetch wrapper around the REST API described in @yishai-cv/shared (libs/shared/src/types.ts).
//
// Angular equivalent: an injectable `ApiService` built on HttpClient.
// React has no DI container — a plain module that exports functions is the
// idiomatic way to share "services". Components just `import { api }`.
// ============================================================
import type {
  CreateVersionBody,
  Revision,
  RevisionSummary,
  UpdateVersionBody,
  Version,
  VersionSummary,
} from '@yishai-cv/shared';

/** Error thrown for any non-2xx response; `message` is the server's `{ error }` text when available. */
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch() only rejects on network failure (server down, proxy can't connect...).
    throw new ApiError(0, `Network error calling ${method} ${path} — is the API server running on :3001?`);
  }

  if (!res.ok) {
    let message = `${method} ${path} failed with HTTP ${res.status}`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json?.error) message = json.error;
    } catch {
      /* body wasn't JSON — keep the generic message */
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content (DELETE) has no body to parse.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  listVersions: () => request<VersionSummary[]>('GET', '/api/versions'),
  getVersion: (id: number) => request<Version>('GET', `/api/versions/${id}`),
  createVersion: (body: CreateVersionBody) => request<Version>('POST', '/api/versions', body),
  updateVersion: (id: number, body: UpdateVersionBody) => request<Version>('PUT', `/api/versions/${id}`, body),
  deleteVersion: (id: number) => request<void>('DELETE', `/api/versions/${id}`),
  listRevisions: (versionId: number) => request<RevisionSummary[]>('GET', `/api/versions/${versionId}/revisions`),
  getRevision: (id: number) => request<Revision>('GET', `/api/revisions/${id}`),
  restoreRevision: (versionId: number, revisionId: number) =>
    request<Version>('POST', `/api/versions/${versionId}/restore/${revisionId}`),
};

/** Turn anything caught in a `catch` into a human-readable message. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
