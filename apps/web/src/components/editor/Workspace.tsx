// ============================================================
// Workspace = everything for ONE loaded version: toolbar (save/print),
// editor panels (middle column) and live preview (right column).
//
// <App> renders it as <Workspace key={…} version={…} />. The `key` matters:
// when it changes (another version selected, or a revision restored), React
// throws this component away and mounts a fresh one, so useReducer/useState
// start over from the new `version` prop. That's the idiomatic "reset all
// state when an input changes" trick — much simpler than syncing in an effect.
// ============================================================
import { useEffect, useState } from 'react';
import type { Revision, Version, VersionSummary } from '@yishai-cv/shared';
import { api, errorMessage } from '../../api.ts';
import { useBeforeUnload } from '../../hooks/useBeforeUnload.ts';
import { useCvDocument } from '../../hooks/useCvDocument.ts';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut.ts';
import { useToast } from '../../hooks/useToast.tsx';
import { HistoryPanel } from './HistoryPanel.tsx';
import { PreviewPane } from './PreviewPane.tsx';
import { VersionMetaPanel, type VersionMeta } from './VersionMetaPanel.tsx';
import {
  ContactSection,
  EducationSection,
  HeaderSection,
  LanguageSection,
  MilitarySection,
  SummarySection,
} from './sections/BasicSections.tsx';
import { JobsSection } from './sections/JobsSection.tsx';
import { LanguagesSection, SkillsSection, StrengthsSection } from './sections/ListSections.tsx';

interface WorkspaceProps {
  version: Version;
  /** Tell the parent the list entry changed (name, updatedAt…). Angular: @Output() saved. */
  onSaved: (summary: VersionSummary) => void;
  /** Tell the parent to swap in a freshly loaded version (after a restore). */
  onReplaced: (version: Version) => void;
  /** Report dirty state upward so App can warn before switching versions. */
  onDirtyChange: (dirty: boolean) => void;
}

function metaOf(v: VersionSummary): VersionMeta {
  return { name: v.name, targetCompany: v.targetCompany, targetRole: v.targetRole, description: v.description };
}

export function Workspace({ version, onSaved, onReplaced, onDirtyChange }: WorkspaceProps) {
  const toast = useToast();

  // --- the CV document (useReducer inside the custom hook) ---
  const { data, dispatch, isDirty: dataDirty, markSaved } = useCvDocument(version.data);

  // --- version meta (plain useState: a small flat object) ---
  const [meta, setMeta] = useState<VersionMeta>(() => metaOf(version)); // lazy initializer: runs once
  const [savedMeta, setSavedMeta] = useState<VersionMeta>(() => metaOf(version));
  const metaDirty = JSON.stringify(meta) !== JSON.stringify(savedMeta);
  const isDirty = dataDirty || metaDirty;

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [previewRevision, setPreviewRevision] = useState<Revision | null>(null);

  // Child → parent notification. Runs after render whenever isDirty flips.
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);
  // …and reset to "clean" when this workspace unmounts.
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  useBeforeUnload(isDirty);

  async function save() {
    if (!isDirty || saving) return;
    if (!meta.name.trim()) {
      toast.error('The version needs a name.');
      return;
    }
    setSaving(true);
    // Capture what we send, so we can mark exactly that as "saved" afterwards
    // even if the user keeps typing while the request is in flight.
    const sentData = data;
    const sentMeta = meta;
    try {
      const updated = await api.updateVersion(version.id, {
        ...sentMeta,
        // Only send `data` when it changed — the server creates a revision for every data save.
        ...(dataDirty ? { data: sentData, note: note.trim() || undefined } : {}),
      });
      markSaved(sentData);
      setSavedMeta(sentMeta);
      if (dataDirty) {
        setNote('');
        setHistoryKey((k) => k + 1); // re-fetch the history list
      }
      onSaved(updated);
      toast.success('Saved');
    } catch (err) {
      toast.error(`Save failed: ${errorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  }

  useKeyboardShortcut('s', save);

  async function handlePreviewRevision(revisionId: number | null) {
    if (revisionId === null) return setPreviewRevision(null);
    try {
      setPreviewRevision(await api.getRevision(revisionId));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleRestore(revisionId: number) {
    const msg = isDirty
      ? `Restore revision #${revisionId}? Your unsaved changes will be lost.`
      : `Restore revision #${revisionId}? (The current state stays in history.)`;
    if (!window.confirm(msg)) return;
    try {
      const restored = await api.restoreRevision(version.id, revisionId);
      onDirtyChange(false);
      onReplaced(restored); // App bumps the key → this component remounts with the restored data
      toast.success(`Restored revision #${revisionId}`);
    } catch (err) {
      toast.error(`Restore failed: ${errorMessage(err)}`);
    }
  }

  function handlePrint() {
    // While previewing a past revision, print that revision instead.
    if (previewRevision) {
      window.open(`/?print=${version.id}&rev=${previewRevision.id}`, '_blank');
      return;
    }
    if (isDirty && !window.confirm('Print uses the last SAVED version. You have unsaved changes — print anyway?')) {
      return;
    }
    window.open(`/?print=${version.id}`, '_blank');
  }

  return (
    <>
      {/* React 19 hoists <title> into <head>, so the tab shows the version and its save state. */}
      <title>{`${isDirty ? '● ' : ''}${meta.name || 'Untitled version'} · CV Studio`}</title>
      <div className="editor-col">
        <div className="toolbar">
          <div className="toolbar__title">
            <h1>{meta.name || 'Untitled version'}</h1>
            {isDirty ? (
              <span className="status status--dirty">● Unsaved changes</span>
            ) : (
              <span className="status status--clean">✓ All changes saved</span>
            )}
          </div>
          <div className="toolbar__actions">
            <input
              className="input toolbar__note"
              placeholder="Revision note (optional)"
              aria-label="Revision note"
              value={note}
              disabled={!dataDirty}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={save}
              disabled={!isDirty || saving}
              title="Save (⌘S / Ctrl+S)"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn" onClick={handlePrint} title="Open a print-ready page (save as PDF)">
              Print / PDF
            </button>
          </div>
        </div>

        <div className="editor-col__scroll">
          <VersionMetaPanel meta={meta} onChange={setMeta} />
          <HistoryPanel
            versionId={version.id}
            refreshKey={historyKey}
            previewingId={previewRevision?.id ?? null}
            onPreview={handlePreviewRevision}
            onRestore={handleRestore}
          />

          <h3 className="editor-col__group-title">CV content</h3>
          <LanguageSection language={data.language ?? 'en'} dispatch={dispatch} />
          <HeaderSection header={data.header} dispatch={dispatch} />
          <SummarySection summary={data.summary} dispatch={dispatch} />
          <SkillsSection skills={data.skills} dispatch={dispatch} />
          <JobsSection jobs={data.jobs} dispatch={dispatch} />
          <StrengthsSection strengths={data.strengths} dispatch={dispatch} />
          <ContactSection contact={data.contact} dispatch={dispatch} />
          <EducationSection education={data.education} dispatch={dispatch} />
          <LanguagesSection languages={data.languages} dispatch={dispatch} />
          <MilitarySection military={data.military} dispatch={dispatch} />
        </div>
      </div>

      {/* Same <PreviewPane>, different data: either the live draft or a read-only revision. */}
      <PreviewPane
        data={previewRevision ? previewRevision.data : data}
        banner={
          previewRevision && (
            <div className="banner banner--info">
              <span>
                Previewing revision #{previewRevision.id} (read-only)
                {previewRevision.note && ` — “${previewRevision.note}”`}
              </span>
              <span className="row">
                <button type="button" className="btn btn--small" onClick={() => handleRestore(previewRevision.id)}>
                  Restore this
                </button>
                <button type="button" className="btn btn--small btn--ghost" onClick={() => setPreviewRevision(null)}>
                  Back to current
                </button>
              </span>
            </div>
          )
        }
      />
    </>
  );
}
