// ============================================================
// REACT CONCEPT: custom hook + useEffect cleanup + the "latest ref" pattern.
//
// useEffect(setup, deps) runs `setup` after render; the function it returns is
// the cleanup (runs before the next setup and on unmount). Angular equivalent:
// ngOnInit/ngOnDestroy, but tied to specific dependencies.
//
// Problem: if we registered `handler` directly, the listener would capture the
// handler from the first render (a "stale closure") or we'd re-subscribe on
// every render. Instead we keep the newest handler in a ref and subscribe once.
// ============================================================
import { useEffect, useRef } from 'react';

/** Calls `handler` on Cmd+<key> (macOS) or Ctrl+<key> (others). Prevents the browser default. */
export function useKeyboardShortcut(key: string, handler: () => void): void {
  const handlerRef = useRef(handler);

  // Update the ref after every render so the listener always sees the latest handler.
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handlerRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown); // cleanup
  }, [key]);
}
