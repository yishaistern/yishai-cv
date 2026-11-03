// ============================================================
// Left column: the list of tailored CV versions.
//
// This component owns NO data about versions — the list, the selection and
// the create/delete operations all come from <App> via props. It's a
// "presentational" component: data in via props (@Input), events out via
// callbacks (@Output). Only the "is the New-version form open?" flag is local.
// ============================================================
import { useState, type SubmitEvent } from 'react';
import type { CreateVersionBody, VersionSummary } from '@yishai-cv/shared';
import { TextAreaField, TextField } from './fields.tsx';
import { formatDateTime } from './format.ts';

interface VersionsSidebarProps {
  versions: VersionSummary[];
  selectedId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
  onCreate: (body: CreateVersionBody) => Promise<void>;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}

export function VersionsSidebar({
  versions,
  selectedId,
  loading,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
}: VersionsSidebarProps) {
  const [creating, setCreating] = useState(false);

  return (
    <aside className="sidebar-col">
      <div className="sidebar-col__brand">
        <span className="brand-dot" aria-hidden="true" />
        CV Studio
      </div>

      <div className="sidebar-col__head">
        <h2>Versions</h2>
        <button type="button" className="btn btn--small btn--primary" onClick={() => setCreating((c) => !c)}>
          {creating ? 'Cancel' : '+ New'}
        </button>
      </div>

      {creating && (
        <NewVersionForm
          canDuplicate={selectedId !== null}
          onCancel={() => setCreating(false)}
          onSubmit={async (body) => {
            await onCreate(body);
            setCreating(false);
          }}
          currentId={selectedId}
        />
      )}

      {loading && versions.length === 0 && <p className="muted pad">Loading…</p>}
      {!loading && versions.length === 0 && <p className="muted pad">No versions yet. Create one!</p>}

      <ul className="version-list">
        {versions.map((v) => (
          <li key={v.id}>
            <div className={`version-item ${v.id === selectedId ? 'is-selected' : ''}`}>
              <button type="button" className="version-item__main" onClick={() => onSelect(v.id)}>
                <span className="version-item__name">{v.name}</span>
                {(v.targetCompany || v.targetRole) && (
                  <span className="version-item__target">
                    {[v.targetCompany, v.targetRole].filter(Boolean).join(' · ')}
                  </span>
                )}
                <span className="version-item__time">Updated {formatDateTime(v.updatedAt)}</span>
              </button>
              <button
                type="button"
                className="icon-btn version-item__action"
                aria-label={`Duplicate version "${v.name}"`}
                title="Duplicate version (last saved state)"
                onClick={() => onDuplicate(v.id)}
              >
                ⧉
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--danger version-item__action version-item__delete"
                aria-label={`Delete version "${v.name}"`}
                title="Delete version"
                onClick={() => onDelete(v.id)}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ---------------- "New version" form ----------------

interface NewVersionFormProps {
  canDuplicate: boolean;
  currentId: number | null;
  onSubmit: (body: CreateVersionBody) => Promise<void>;
  onCancel: () => void;
}

function NewVersionForm({ canDuplicate, currentId, onSubmit, onCancel }: NewVersionFormProps) {
  // One state object for the whole form. Updating one field = spread + override.
  const [form, setForm] = useState({
    name: '',
    targetCompany: '',
    targetRole: '',
    description: '',
    startFrom: canDuplicate ? 'current' : 'base',
  });
  const [submitting, setSubmitting] = useState(false);

  // A tiny helper that returns an onChange handler for a given field.
  // `keyof typeof form` makes `field` type-checked against the state's keys.
  const set = (field: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        targetCompany: form.targetCompany.trim(),
        targetRole: form.targetRole.trim(),
        description: form.description,
        fromVersionId: form.startFrom === 'current' && currentId !== null ? currentId : undefined,
        language: form.startFrom === 'base-he' ? 'he' : undefined,
      });
    } catch {
      // The parent already showed the error as a toast; keep the form open so nothing is lost.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="new-version" onSubmit={handleSubmit}>
      <TextField label="Name *" value={form.name} onChange={set('name')} placeholder="Buildots – Full-Stack TL" />
      <TextField label="Target company" value={form.targetCompany} onChange={set('targetCompany')} />
      <TextField label="Target role" value={form.targetRole} onChange={set('targetRole')} />
      <TextAreaField label="Description" rows={2} value={form.description} onChange={set('description')} />

      <fieldset className="radio-group">
        <legend className="field__label">Start from</legend>
        <label>
          <input
            type="radio"
            name="startFrom"
            checked={form.startFrom === 'base'}
            onChange={() => set('startFrom')('base')}
          />
          Base CV (English)
        </label>
        <label>
          <input
            type="radio"
            name="startFrom"
            checked={form.startFrom === 'base-he'}
            onChange={() => set('startFrom')('base-he')}
          />
          Base CV (Hebrew)
        </label>
        <label className={canDuplicate ? '' : 'is-disabled'}>
          <input
            type="radio"
            name="startFrom"
            disabled={!canDuplicate}
            checked={form.startFrom === 'current'}
            onChange={() => set('startFrom')('current')}
          />
          Duplicate current (last saved)
        </label>
      </fieldset>

      <div className="row row--end">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={!form.name.trim() || submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  );
}
