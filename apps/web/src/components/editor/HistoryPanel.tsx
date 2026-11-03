// ============================================================
// Revision history for the current version.
//
// REACT CONCEPT: data fetching with useEffect.
//   useEffect(() => { fetch…; return cleanup }, [versionId, refreshKey])
// re-fetches whenever a dependency changes. The `cancelled` flag guards
// against a race: if versionId changes while a request is in flight, the old
// response must not overwrite the new list. (Angular: switchMap does this.)
// ============================================================
import { useEffect, useState } from 'react';
import type { RevisionSummary } from '@yishai-cv/shared';
import { api, errorMessage } from '../../api.ts';
import { useToast } from '../../hooks/useToast.tsx';
import { Section } from './Section.tsx';
import { formatDateTime } from './format.ts';

interface HistoryPanelProps {
  versionId: number;
  /** Bump this number to force a reload (e.g. after a save). */
  refreshKey: number;
  previewingId: number | null;
  onPreview: (revisionId: number | null) => void;
  onRestore: (revisionId: number) => void;
}

export function HistoryPanel({ versionId, refreshKey, previewingId, onPreview, onRestore }: HistoryPanelProps) {
  const [revisions, setRevisions] = useState<RevisionSummary[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    api
      .listRevisions(versionId)
      .then((list) => {
        if (!cancelled) setRevisions(list);
      })
      .catch((err) => {
        if (!cancelled) toast.error(`Couldn't load history: ${errorMessage(err)}`);
      });
    return () => {
      cancelled = true;
    };
  }, [versionId, refreshKey, toast]);

  return (
    <Section title="History" count={revisions?.length}>
      {revisions === null ? (
        <p className="muted">Loading…</p>
      ) : revisions.length === 0 ? (
        <p className="muted">No revisions yet — every save with CV changes creates one.</p>
      ) : (
        <ul className="history-list">
          {revisions.map((r, i) => (
            <li key={r.id} className={`history-item ${previewingId === r.id ? 'is-active' : ''}`}>
              <div className="history-item__text">
                <span className="history-item__note">
                  #{r.id} {r.note || <em className="muted">(no note)</em>}
                  {i === 0 && <span className="pill">latest</span>}
                </span>
                <span className="history-item__time">{formatDateTime(r.createdAt)}</span>
              </div>
              <div className="history-item__actions">
                {previewingId === r.id ? (
                  <button type="button" className="btn btn--small" onClick={() => onPreview(null)}>
                    Close preview
                  </button>
                ) : (
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => onPreview(r.id)}>
                    Preview
                  </button>
                )}
                <button type="button" className="btn btn--small btn--ghost" onClick={() => onRestore(r.id)}>
                  Restore
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
