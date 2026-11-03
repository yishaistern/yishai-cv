// ============================================================
// Small form building blocks.
//
// REACT CONCEPT: controlled inputs.
//   <input value={value} onChange={e => onChange(e.target.value)} />
// React state is the single source of truth; the input just displays it and
// reports keystrokes. Angular equivalent: [ngModel] + (ngModelChange) — but
// explicit, with no two-way binding magic.
// ============================================================
import { useId, type ReactNode } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'tel';
  /** Extra content rendered after the input (e.g. an image preview). */
  addon?: ReactNode;
}

export function TextField({ label, value, onChange, placeholder, type = 'text', addon }: TextFieldProps) {
  const id = useId(); // links <label htmlFor> with <input id> — accessible, unique per instance
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__row">
        <input
          id={id}
          className="input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {addon}
      </div>
    </div>
  );
}

interface TextAreaFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  /** Show a "123 chars" counter. */
  showCount?: boolean;
  hint?: ReactNode;
  ariaLabel?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  showCount = false,
  hint,
  ariaLabel,
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className="input textarea"
        value={value}
        rows={rows}
        placeholder={placeholder}
        aria-label={label ? undefined : ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      />
      {(hint || showCount) && (
        <div className="field__meta">
          <span>{hint}</span>
          {showCount && <span className="field__count">{value.length} chars</span>}
        </div>
      )}
    </div>
  );
}

/** The reminder that **text** renders bold in the CV. */
export function BoldHint() {
  return (
    <span className="hint">
      Tip: wrap text in <code>**double asterisks**</code> to make it <strong>bold</strong>.
    </span>
  );
}

/** Eye toggle used for hide/show on list items. */
export function VisibilityToggle({
  hidden,
  onToggle,
  label,
}: {
  hidden: boolean | undefined;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`icon-btn ${hidden ? 'is-off' : ''}`}
      onClick={onToggle}
      aria-pressed={!hidden}
      aria-label={hidden ? `Show "${label}" in CV` : `Hide "${label}" from CV`}
      title={hidden ? 'Hidden from CV — click to show' : 'Visible in CV — click to hide'}
    >
      {hidden ? '◌' : '◉'}
    </button>
  );
}

export function DeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="icon-btn icon-btn--danger" onClick={onClick} aria-label={`Delete "${label}"`} title="Delete">
      ×
    </button>
  );
}
