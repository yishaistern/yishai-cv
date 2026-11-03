// ============================================================
// List-shaped sections: skills, core strengths, languages.
// All three reuse <SortableList> — notice how `renderItem` gets a correctly
// typed `skill` / `strength` / `language` thanks to the generic T.
// ============================================================
import { useState, type FormEvent } from 'react';
import type { Language, Skill, Strength } from '@yishai-cv/shared';
import type { CvDispatch } from '../../../cvReducer.ts';
import { Section } from '../Section.tsx';
import { SortableList } from '../SortableList.tsx';
import { BoldHint, DeleteButton, VisibilityToggle } from '../fields.tsx';

// ---------------- Skills ----------------

export function SkillsSection({ skills, dispatch }: { skills: Skill[]; dispatch: CvDispatch }) {
  // Local state for the "add skill" input — only this component cares about it.
  const [newLabel, setNewLabel] = useState('');
  const visible = skills.filter((s) => !s.hidden).length;

  function addSkill(e: FormEvent) {
    e.preventDefault(); // stop the browser's full-page form submit
    const label = newLabel.trim();
    if (!label) return;
    // The id is generated HERE (event handler), not in the reducer, to keep the reducer pure.
    dispatch({ type: 'skills/add', id: crypto.randomUUID(), label });
    setNewLabel('');
  }

  return (
    <Section title="Skills / Tech stack" count={visible}>
      <p className="hint">Order matters — put the skills the job post asks for first. Hidden skills stay saved but don’t print.</p>
      <SortableList
        items={skills}
        className="sortable--compact"
        onMove={(from, to) => dispatch({ type: 'skills/move', from, to })}
        getLabel={(s) => s.label}
        isMuted={(s) => !!s.hidden}
        renderItem={(skill) => (
          <div className="row">
            <input
              className="input input--inline"
              value={skill.label}
              aria-label="Skill label"
              onChange={(e) => dispatch({ type: 'skills/update', id: skill.id, patch: { label: e.target.value } })}
            />
            <VisibilityToggle
              hidden={skill.hidden}
              label={skill.label}
              onToggle={() => dispatch({ type: 'skills/update', id: skill.id, patch: { hidden: !skill.hidden } })}
            />
            <DeleteButton label={skill.label} onClick={() => dispatch({ type: 'skills/remove', id: skill.id })} />
          </div>
        )}
      />
      <form className="row add-row" onSubmit={addSkill}>
        <input
          className="input"
          placeholder="New skill, e.g. React"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <button type="submit" className="btn" disabled={!newLabel.trim()}>
          Add skill
        </button>
      </form>
    </Section>
  );
}

// ---------------- Core strengths ----------------

export function StrengthsSection({ strengths, dispatch }: { strengths: Strength[]; dispatch: CvDispatch }) {
  return (
    <Section
      title="Core strengths"
      count={strengths.filter((s) => !s.hidden).length}
      actions={
        <button
          type="button"
          className="btn btn--small"
          onClick={() => dispatch({ type: 'strengths/add', id: crypto.randomUUID() })}
        >
          + Add
        </button>
      }
    >
      <p className="hint">
        <BoldHint />
      </p>
      <SortableList
        items={strengths}
        onMove={(from, to) => dispatch({ type: 'strengths/move', from, to })}
        getLabel={(s) => s.label || 'strength'}
        isMuted={(s) => !!s.hidden}
        emptyText="No strengths yet — click + Add."
        renderItem={(s) => (
          <div className="stack">
            <div className="row">
              <input
                className="input input--inline input--strong"
                placeholder="Label, e.g. Technical Leadership"
                aria-label="Strength label"
                value={s.label}
                onChange={(e) => dispatch({ type: 'strengths/update', id: s.id, patch: { label: e.target.value } })}
              />
              <VisibilityToggle
                hidden={s.hidden}
                label={s.label}
                onToggle={() => dispatch({ type: 'strengths/update', id: s.id, patch: { hidden: !s.hidden } })}
              />
              <DeleteButton label={s.label} onClick={() => dispatch({ type: 'strengths/remove', id: s.id })} />
            </div>
            <textarea
              className="input textarea"
              rows={2}
              placeholder="Description"
              aria-label="Strength description"
              value={s.text}
              onChange={(e) => dispatch({ type: 'strengths/update', id: s.id, patch: { text: e.target.value } })}
            />
          </div>
        )}
      />
    </Section>
  );
}

// ---------------- Languages ----------------

export function LanguagesSection({ languages, dispatch }: { languages: Language[]; dispatch: CvDispatch }) {
  return (
    <Section
      title="Languages"
      count={languages.length}
      actions={
        <button
          type="button"
          className="btn btn--small"
          onClick={() => dispatch({ type: 'languages/add', id: crypto.randomUUID() })}
        >
          + Add
        </button>
      }
    >
      <SortableList
        items={languages}
        className="sortable--compact"
        onMove={(from, to) => dispatch({ type: 'languages/move', from, to })}
        getLabel={(l) => l.name || 'language'}
        emptyText="No languages yet."
        renderItem={(l) => (
          <div className="row">
            <input
              className="input input--inline"
              placeholder="Language"
              aria-label="Language name"
              value={l.name}
              onChange={(e) => dispatch({ type: 'languages/update', id: l.id, patch: { name: e.target.value } })}
            />
            <input
              className="input input--inline"
              placeholder="Level, e.g. Native"
              aria-label="Language level"
              value={l.level}
              onChange={(e) => dispatch({ type: 'languages/update', id: l.id, patch: { level: e.target.value } })}
            />
            <DeleteButton label={l.name} onClick={() => dispatch({ type: 'languages/remove', id: l.id })} />
          </div>
        )}
      />
    </Section>
  );
}
