// ============================================================
// Toasts via React Context.
//
// REACT CONCEPT: Context (createContext / useContext)
//   A Provider high in the tree makes a value available to every descendant,
//   without passing it down through every intermediate component's props
//   ("prop drilling"). Angular equivalent: a service provided in a parent
//   component's `providers: []` and injected by children.
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type ToastKind = 'error' | 'success' | 'info';
interface Toast { id: number; kind: ToastKind; message: string }

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
  error: (message: string) => void;
  success: (message: string) => void;
}

// The default value is only used when there's no Provider above — we treat that as a bug.
const ToastContext = createContext<ToastApi | null>(null);

/** Wrap the app in this. `children` is whatever JSX is nested inside <ToastProvider>…</ToastProvider>
 *  (Angular equivalent: <ng-content>). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // useRef holds a mutable value that survives re-renders but doesn't trigger one when changed.
  const nextId = useRef(1);
  // Pending auto-dismiss timers, so they can be cleared if the provider unmounts.
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    // Functional update form: (prev) => next. Safe even if several updates are queued.
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const handle of pending.values()) window.clearTimeout(handle);
      pending.clear();
    };
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      // Errors stay longer so you can actually read them.
      timers.current.set(id, window.setTimeout(() => dismiss(id), kind === 'error' ? 8000 : 3000));
    },
    [dismiss],
  );

  // useMemo keeps the same object identity between renders, so consumers of the
  // context don't re-render just because the provider did.
  const value = useMemo<ToastApi>(
    () => ({ show, error: (m) => show(m, 'error'), success: (m) => show(m, 'success') }),
    [show],
  );

  // React 19: render the context itself as the provider (<Ctx.Provider> is the legacy form).
  return (
    <ToastContext value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            <span>{t.message}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

/** Custom hook = a function starting with `use` that calls other hooks. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast() must be used inside <ToastProvider>');
  return ctx;
}
