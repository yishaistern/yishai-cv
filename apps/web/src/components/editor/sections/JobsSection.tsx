// ============================================================
// Experience editor: jobs → bullet groups → bullets, three nested SortableLists.
//
// REACT CONCEPT: rules of hooks + extracting components.
//   Hooks (useState…) may only be called at the top level of a component, never
//   inside loops, conditions or callbacks. A render-prop callback like
//   `renderItem={(job) => …}` is just a function, so it can't own state.
//   When each job needs its own "expanded?" flag, we render a real component
//   (<JobEditor job={job} />) from the callback; each instance gets its own state,
//   and because SortableList keys rows by job.id, that state follows the job
//   when it's reordered.
// ============================================================
import { useState } from 'react';
import type { BulletGroup, Job } from '@yishai-cv/shared';
import type { CvDispatch, JobPatch } from '../../../cvReducer.ts';
import { Section } from '../Section.tsx';
import { SortableList } from '../SortableList.tsx';
import { BoldHint, DeleteButton, TextField, VisibilityToggle } from '../fields.tsx';

export function JobsSection({ jobs, dispatch }: { jobs: Job[]; dispatch: CvDispatch }) {
  return (
    <Section
      title="Experience"
      count={jobs.filter((j) => !j.hidden).length}
      defaultOpen
      actions={
        <button
          type="button"
          className="btn btn--small"
          onClick={() => dispatch({ type: 'jobs/add', id: crypto.randomUUID(), groupId: crypto.randomUUID() })}
        >
          + Add job
        </button>
      }
    >
      <p className="hint">
        Reorder jobs, bullets and groups by dragging ⋮⋮ or with ↑/↓. Hide bullets that aren’t relevant to this job post
        instead of deleting them. <BoldHint />
      </p>
      <SortableList
        items={jobs}
        className="sortable--cards"
        onMove={(from, to) => dispatch({ type: 'jobs/move', from, to })}
        getLabel={(j) => j.title}
        isMuted={(j) => !!j.hidden}
        emptyText="No jobs yet."
        renderItem={(job) => <JobEditor job={job} dispatch={dispatch} />}
      />
    </Section>
  );
}

function JobEditor({ job, dispatch }: { job: Job; dispatch: CvDispatch }) {
  const [expanded, setExpanded] = useState(false);
  const update = (patch: JobPatch) => dispatch({ type: 'jobs/update', id: job.id, patch });

  const bulletCount = job.groups.reduce((n, g) => n + g.bullets.length, 0);
  const hiddenCount = job.groups.reduce((n, g) => n + g.bullets.filter((b) => b.hidden).length, 0);

  return (
    <div className="job-editor">
      <div className="row">
        <button
          type="button"
          className="job-editor__summary"
          aria-expanded={expanded}
          onClick={() => setExpanded((x) => !x)}
        >
          <span className="panel__chevron" aria-hidden="true">
            {expanded ? '▾' : '▸'}
          </span>
          <span className="job-editor__title">{job.title || 'Untitled job'}</span>
          <span className="job-editor__sub">
            {job.company} {job.dates && `· ${job.dates}`} · {bulletCount} bullets
            {hiddenCount > 0 && ` (${hiddenCount} hidden)`}
            {job.pageBreakBefore && ' · ⤓ page break'}
          </span>
        </button>
        <VisibilityToggle hidden={job.hidden} label={job.title} onToggle={() => update({ hidden: !job.hidden })} />
        <DeleteButton
          label={job.title}
          onClick={() => {
            if (window.confirm(`Delete the job "${job.title}" and all its bullets?`)) {
              dispatch({ type: 'jobs/remove', id: job.id });
            }
          }}
        />
      </div>

      {expanded && (
        <div className="job-editor__body">
          <div className="grid-2">
            <TextField label="Title" value={job.title} onChange={(title) => update({ title })} />
            <TextField
              label="Dates"
              value={job.dates}
              placeholder="2024 – Present"
              onChange={(dates) => update({ dates })}
            />
          </div>
          <TextField
            label="Company"
            value={job.company}
            placeholder="ZoomInfo — Productivity Engineering"
            onChange={(company) => update({ company })}
          />
          <TextField
            label="Logo path"
            value={job.logo ?? ''}
            placeholder="images/zoominfo.png"
            // Empty string → remove the property (undefined) so the CV shows no logo.
            onChange={(logo) => update({ logo: logo || undefined })}
            addon={job.logo ? <img className="logo-preview" src={`/${job.logo.replace(/^\//, '')}`} alt="" /> : null}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={!!job.pageBreakBefore}
              onChange={(e) => update({ pageBreakBefore: e.target.checked || undefined })}
            />
            Start this job on a new page when printing
          </label>

          <h4 className="subhead">Bullet groups</h4>
          <SortableList
            items={job.groups}
            className="sortable--groups"
            onMove={(from, to) => dispatch({ type: 'groups/move', jobId: job.id, from, to })}
            getLabel={(g) => g.heading || 'group'}
            emptyText="No bullet groups."
            renderItem={(group) => <GroupEditor jobId={job.id} group={group} dispatch={dispatch} />}
          />
          <button
            type="button"
            className="btn btn--small btn--ghost"
            onClick={() => dispatch({ type: 'groups/add', jobId: job.id, id: crypto.randomUUID() })}
          >
            + Add bullet group
          </button>

          <h4 className="subhead">Highlight box</h4>
          {/* Conditional rendering with a ternary: show the editor if there is a highlight,
              otherwise a button to create one. Angular: @if (…) { } @else { } */}
          {job.highlight ? (
            <div className="highlight-editor">
              <div className="row">
                <input
                  className="input input--inline input--strong"
                  placeholder="Label, e.g. Hands-on AI leadership:"
                  aria-label="Highlight label"
                  value={job.highlight.label}
                  onChange={(e) => update({ highlight: { ...job.highlight!, label: e.target.value } })}
                />
                <button
                  type="button"
                  className="btn btn--small btn--ghost"
                  onClick={() => update({ highlight: undefined })}
                >
                  Remove highlight
                </button>
              </div>
              <textarea
                className="input textarea"
                rows={3}
                aria-label="Highlight text"
                value={job.highlight.text}
                onChange={(e) => update({ highlight: { ...job.highlight!, text: e.target.value } })}
              />
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => update({ highlight: { label: '', text: '' } })}
            >
              + Add highlight box
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GroupEditor({ jobId, group, dispatch }: { jobId: string; group: BulletGroup; dispatch: CvDispatch }) {
  const groupId = group.id;
  return (
    <div className="group-editor">
      <div className="row">
        <input
          className="input input--inline input--strong"
          placeholder="Group heading (optional)"
          aria-label="Group heading"
          value={group.heading ?? ''}
          onChange={(e) => dispatch({ type: 'groups/update', jobId, groupId, heading: e.target.value || undefined })}
        />
        <DeleteButton
          label={group.heading || 'bullet group'}
          onClick={() => {
            if (
              group.bullets.length === 0 ||
              window.confirm(`Delete this group and its ${group.bullets.length} bullets?`)
            ) {
              dispatch({ type: 'groups/remove', jobId, groupId });
            }
          }}
        />
      </div>

      <SortableList
        items={group.bullets}
        onMove={(from, to) => dispatch({ type: 'bullets/move', jobId, groupId, from, to })}
        getLabel={(b) => b.text.slice(0, 40) || 'bullet'}
        isMuted={(b) => !!b.hidden}
        emptyText="No bullets in this group."
        renderItem={(bullet) => (
          <div className="row row--top">
            <textarea
              className="input textarea textarea--bullet"
              rows={2}
              aria-label="Bullet text"
              placeholder="Did X using **Y**, resulting in Z"
              value={bullet.text}
              onChange={(e) =>
                dispatch({
                  type: 'bullets/update',
                  jobId,
                  groupId,
                  bulletId: bullet.id,
                  patch: { text: e.target.value },
                })
              }
            />
            <VisibilityToggle
              hidden={bullet.hidden}
              label={bullet.text.slice(0, 40)}
              onToggle={() =>
                dispatch({
                  type: 'bullets/update',
                  jobId,
                  groupId,
                  bulletId: bullet.id,
                  patch: { hidden: !bullet.hidden },
                })
              }
            />
            <DeleteButton
              label={bullet.text.slice(0, 40)}
              onClick={() => dispatch({ type: 'bullets/remove', jobId, groupId, bulletId: bullet.id })}
            />
          </div>
        )}
      />
      <button
        type="button"
        className="btn btn--small btn--ghost"
        onClick={() => dispatch({ type: 'bullets/add', jobId, groupId, id: crypto.randomUUID() })}
      >
        + Add bullet
      </button>
    </div>
  );
}
