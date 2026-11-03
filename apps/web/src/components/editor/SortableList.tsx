// ============================================================
// SortableList<T> — ONE reusable reorderable list used for skills, bullets,
// bullet groups, jobs, strengths and languages.
//
// REACT CONCEPTS shown here:
//  * Generic components: `function SortableList<T extends { id: string }>(props: Props<T>)`.
//    TypeScript infers T from the `items` prop, so `renderItem` receives a fully
//    typed item (a Skill, a Bullet, …) with zero casts at the call site.
//  * Render props: instead of the list knowing how to draw a Skill, the parent
//    passes a function `renderItem(item, index) => JSX`. Angular equivalent:
//    an <ng-template> passed in and rendered with *ngTemplateOutlet + context.
//  * Keys: each row gets `key={item.id}` (a stable id — never the index!) so React
//    can match rows between renders. With index keys, moving a row would make React
//    reuse the wrong DOM nodes (e.g. a textarea keeps focus/cursor of another item).
//  * Local UI state (which row is dragged / hovered) lives here with useState;
//    the actual ORDER lives in the parent (the reducer) — the list just reports
//    `onMove(from, to)`. That's "lifting state up": the source of truth sits in the
//    closest common owner, children get data via props and report changes via callbacks.
//
// Drag & drop uses the native HTML5 API (draggable / dragstart / dragover / drop).
// Only the ⋮⋮ handle is draggable, so you can still select text in inputs.
// ↑/↓ buttons give a keyboard-accessible alternative.
// ============================================================
import { useId, useState, type DragEvent, type ReactNode } from 'react';

interface SortableListProps<T extends { id: string }> {
  items: readonly T[];
  /** Called with the old and new index; the parent updates its state. Like an Angular @Output(). */
  onMove: (from: number, to: number) => void;
  /** Render prop: how to draw one item. */
  renderItem: (item: T, index: number) => ReactNode;
  /** Used in aria-labels of the move buttons, e.g. (skill) => skill.label */
  getLabel?: (item: T) => string;
  /** Optional: render the row dimmed (e.g. hidden items). */
  isMuted?: (item: T) => boolean;
  /** Shown when the list is empty. */
  emptyText?: string;
  className?: string;
}

// Nested lists (bullets inside groups inside jobs) all receive bubbling drag
// events. We remember which list started the drag so each list only reacts to
// its own items and lets foreign drags bubble up to the parent list.
// A module-level variable is fine here: only one drag can happen at a time.
let activeDrag: { listId: string; index: number } | null = null;

export function SortableList<T extends { id: string }>({
  items,
  onMove,
  renderItem,
  getLabel = () => 'item',
  isMuted,
  emptyText = 'Nothing here yet.',
  className = '',
}: SortableListProps<T>) {
  // useId() gives a stable, unique id per component instance.
  const listId = useId();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const isOwnDrag = () => activeDrag?.listId === listId;

  function handleDragStart(e: DragEvent<HTMLElement>, index: number) {
    e.stopPropagation(); // don't let a parent list think *it* started a drag
    activeDrag = { listId, index };
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index)); // Firefox needs some data to start a drag
    // Use the whole row as the drag "ghost" image rather than just the handle.
    const row = (e.currentTarget as HTMLElement).closest('.sortable__row');
    if (row) e.dataTransfer.setDragImage(row, 16, 16);
  }

  function handleDragOver(e: DragEvent<HTMLElement>, index: number) {
    if (!isOwnDrag()) return; // a drag from another list — let it bubble
    e.preventDefault(); // preventDefault on dragover = "dropping here is allowed"
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) setOverIndex(index);
  }

  function handleDrop(e: DragEvent<HTMLElement>, index: number) {
    if (!isOwnDrag() || activeDrag === null) return;
    e.preventDefault();
    e.stopPropagation();
    const from = activeDrag.index;
    if (from !== index) onMove(from, index);
    resetDrag();
  }

  function resetDrag() {
    activeDrag = null;
    setDragIndex(null);
    setOverIndex(null);
  }

  // Conditional rendering: an early return is the simplest form.
  if (items.length === 0) {
    return <p className="sortable__empty">{emptyText}</p>;
  }

  return (
    <ul className={`sortable ${className}`}>
      {items.map((item, index) => {
        const label = getLabel(item);
        const classes = [
          'sortable__row',
          dragIndex === index && 'is-dragging',
          overIndex === index && dragIndex !== index && (dragIndex! < index ? 'is-over-after' : 'is-over-before'),
          isMuted?.(item) && 'is-muted',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li
            key={item.id}
            className={classes}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <span
              className="sortable__handle"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={resetDrag}
              title="Drag to reorder"
              aria-hidden="true"
            >
              ⋮⋮
            </span>

            <div className="sortable__content">{renderItem(item, index)}</div>

            <span className="sortable__arrows">
              <button
                type="button"
                className="icon-btn"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
                aria-label={`Move "${label}" up`}
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                disabled={index === items.length - 1}
                onClick={() => onMove(index, index + 1)}
                aria-label={`Move "${label}" down`}
                title="Move down"
              >
                ↓
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
