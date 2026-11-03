import { useEffect } from 'react';

/**
 * While `when` is true, closing/reloading the tab shows the browser's
 * "Leave site? Changes you made may not be saved" prompt.
 * The effect re-runs whenever `when` changes (it's in the dependency array).
 */
export function useBeforeUnload(when: boolean): void {
  useEffect(() => {
    if (!when) return; // nothing to subscribe → no cleanup needed
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // required by some browsers to show the prompt
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);
}
