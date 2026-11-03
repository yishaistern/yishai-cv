// ============================================================
// App — the root component.
//
// REACT CONCEPT: rules of hooks. Hooks must be called in the same order on
// every render, so a component can't do `if (print) return …` *before* its
// hooks. Instead App picks between two components, and each one calls its own
// hooks unconditionally.
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import type { CreateVersionBody, Version, VersionSummary } from '@yishai-cv/shared';
import { api, errorMessage } from './api.ts';
import { PrintView } from './components/editor/PrintView.tsx';
import { VersionsSidebar } from './components/editor/VersionsSidebar.tsx';
import { Workspace } from './components/editor/Workspace.tsx';
import { useToast } from './hooks/useToast.tsx';

export default function App() {
  // Read once from the URL: /?print=12  or  /?print=12&rev=40
  const params = new URLSearchParams(window.location.search);
  const printId = params.get('print');
  if (printId) {
    const rev = params.get('rev');
    return <PrintView versionId={Number(printId)} revisionId={rev ? Number(rev) : undefined} />;
  }
  return <Dashboard />;
}

const LAST_VERSION_KEY = 'cv-dashboard:lastVersionId';

function Dashboard() {
  const toast = useToast();

  // ---- state owned by the dashboard (lifted here because several children need it) ----
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const stored = Number(localStorage.getItem(LAST_VERSION_KEY));
    return stored > 0 ? stored : null;
  });
  const [current, setCurrent] = useState<Version | null>(null);
  // Incremented to force <Workspace> to remount (fresh state) for the same version id.
  const [workspaceNonce, setWorkspaceNonce] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // ---- load the versions list once on mount (empty deps array = "on init") ----
  useEffect(() => {
    api
      .listVersions()
      .then((list) => {
        setVersions(list);
        // Pick a version if none (or a deleted one) is selected.
        setSelectedId((id) => (id !== null && list.some((v) => v.id === id) ? id : (list[0]?.id ?? null)));
      })
      .catch((err) => toast.error(`Couldn't load versions: ${errorMessage(err)}`))
      .finally(() => setLoadingList(false));
  }, [toast]);

  // ---- load the selected version whenever selectedId changes ----
  useEffect(() => {
    if (selectedId === null) {
      setCurrent(null);
      return;
    }
    localStorage.setItem(LAST_VERSION_KEY, String(selectedId));
    let cancelled = false;
    api
      .getVersion(selectedId)
      .then((v) => {
        if (!cancelled) setCurrent(v);
      })
      .catch((err) => {
        if (!cancelled) toast.error(`Couldn't load version: ${errorMessage(err)}`);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, toast]);

  /** Ask before throwing away unsaved edits. */
  const confirmDiscard = () => !isDirty || window.confirm('You have unsaved changes. Discard them?');

  function handleSelect(id: number) {
    if (id === selectedId || !confirmDiscard()) return;
    setIsDirty(false);
    setSelectedId(id);
  }

  async function handleCreate(body: CreateVersionBody) {
    if (!confirmDiscard()) return;
    try {
      const created = await api.createVersion(body);
      setVersions((list) => [toSummary(created), ...list]);
      setIsDirty(false);
      setCurrent(created); // we already have the full version — no need to refetch
      setSelectedId(created.id);
      toast.success(`Created “${created.name}”`);
    } catch (err) {
      toast.error(`Create failed: ${errorMessage(err)}`);
      throw err; // let the form know it failed (it stays open)
    }
  }

  async function handleDelete(id: number) {
    const v = versions.find((x) => x.id === id);
    if (!window.confirm(`Delete version “${v?.name ?? id}” and all its history? This cannot be undone.`)) return;
    try {
      await api.deleteVersion(id);
      const remaining = versions.filter((x) => x.id !== id);
      setVersions(remaining);
      if (id === selectedId) {
        setIsDirty(false);
        setSelectedId(remaining[0]?.id ?? null);
      }
      toast.success('Version deleted');
    } catch (err) {
      toast.error(`Delete failed: ${errorMessage(err)}`);
    }
  }

  // useCallback gives these callbacks a stable identity, so Workspace's effects
  // that depend on them (e.g. onDirtyChange) don't re-run on every App render.
  const handleSaved = useCallback((summary: VersionSummary) => {
    // Replace the entry and move it to the top (list is ordered by updatedAt desc).
    setVersions((list) => [toSummary(summary), ...list.filter((v) => v.id !== summary.id)]);
  }, []);

  const handleReplaced = useCallback(
    (v: Version) => {
      setCurrent(v);
      setWorkspaceNonce((n) => n + 1);
      handleSaved(v);
    },
    [handleSaved],
  );

  return (
    <div className="app">
      <VersionsSidebar
        versions={versions}
        selectedId={selectedId}
        loading={loadingList}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />

      {/* Conditional rendering: only mount the workspace once the selected version is loaded. */}
      {current && current.id === selectedId ? (
        <Workspace
          key={`${current.id}:${workspaceNonce}`}
          version={current}
          onSaved={handleSaved}
          onReplaced={handleReplaced}
          onDirtyChange={setIsDirty} // state setters are stable — safe to pass directly
        />
      ) : (
        <div className="empty-state">
          {selectedId === null ? (loadingList ? 'Loading…' : 'Create a version to get started.') : 'Loading version…'}
        </div>
      )}
    </div>
  );
}

/** Strip `data` so we don't keep big CV objects in the sidebar list. */
function toSummary(v: VersionSummary): VersionSummary {
  const { id, name, description, targetCompany, targetRole, createdAt, updatedAt } = v;
  return { id, name, description, targetCompany, targetRole, createdAt, updatedAt };
}
