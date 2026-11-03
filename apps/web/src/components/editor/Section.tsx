// ============================================================
// Collapsible panel.
//
// REACT CONCEPT: props + children.
//   <Section title="Skills" count={12}> …anything… </Section>
// `title`/`count` are like Angular @Input()s; `children` is the nested JSX,
// like <ng-content>. The open/closed flag is *local* state — no one else needs
// it, so it stays here instead of being lifted up.
// ============================================================
import { useId, useState, type ReactNode } from 'react';

interface SectionProps {
  title: string;
  /** Small badge next to the title (e.g. number of items). */
  count?: number;
  defaultOpen?: boolean;
  /** Extra buttons on the right side of the header. */
  actions?: ReactNode;
  children: ReactNode;
}

export function Section({ title, count, defaultOpen = false, actions, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section className={`panel ${open ? 'is-open' : ''}`}>
      <header className="panel__header">
        <button
          type="button"
          className="panel__toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="panel__chevron" aria-hidden="true">
            ▸
          </span>
          <span className="panel__title">{title}</span>
          {/* `cond && <jsx/>` renders nothing when cond is false/undefined.
              Careful: `0 && …` would render "0", hence the explicit !== undefined. */}
          {count !== undefined && <span className="panel__count">{count}</span>}
        </button>
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      {/* Conditional rendering: closed sections aren't rendered at all (cheaper DOM).
          Angular equivalent: *ngIf / @if. */}
      {open && (
        <div className="panel__body" id={bodyId}>
          {children}
        </div>
      )}
    </section>
  );
}
