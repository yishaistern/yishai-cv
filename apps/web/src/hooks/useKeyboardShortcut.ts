// ============================================================
// REACT CONCEPT: custom hook + useEffect cleanup + Effect Events.
//
// useEffect(setup, deps) runs `setup` after render; the function it returns is
// the cleanup (runs before the next setup and on unmount). Angular equivalent:
// ngOnInit/ngOnDestroy, but tied to specific dependencies.
//
// Problem: the listener must call the *latest* `handler` (it closes over fresh
// state on every render), but we don't want to re-subscribe on every render.
// useEffectEvent (React 19.2+) solves exactly this: `onShortcut` always sees the
// latest props/state, and it is deliberately NOT listed as an effect dependency.
// ============================================================
import { useEffect, useEffectEvent } from 'react';

/** Calls `handler` on Cmd+<key> (macOS) or Ctrl+<key> (others). Prevents the browser default. */
export function useKeyboardShortcut(key: string, handler: () => void): void {
  const onShortcut = useEffectEvent(handler);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        onShortcut();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown); // cleanup
  }, [key]);
}
