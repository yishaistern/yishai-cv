// ============================================================
// useCvDocument — the editable CV document + "is it dirty?" tracking.
//
// Wraps useReducer(cvReducer) and remembers the last *saved* snapshot so we can
// compare. A custom hook lets a component say *what* it needs
// (`const doc = useCvDocument(version.data)`) and hides *how*.
// ============================================================
import { useCallback, useMemo, useReducer, useState } from 'react';
import type { CvData } from '@yishai-cv/shared';
import { cvReducer } from '../cvReducer.ts';

export function useCvDocument(initial: CvData) {
  // useReducer(reducer, initialState): `initial` is only read on the FIRST render.
  // To start over with different data, either dispatch {type:'load'} or remount
  // the component with a new `key` (that's what App does when switching versions).
  const [data, dispatch] = useReducer(cvReducer, initial);
  const [saved, setSaved] = useState<CvData>(initial);

  // Derived state: don't store `isDirty` in state — compute it from what you have.
  // useMemo caches the (cheap but not free) JSON comparison until data/saved change.
  const isDirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(saved), [data, saved]);

  /** Call after a successful save with the exact data that was sent. */
  const markSaved = useCallback((snapshot: CvData) => setSaved(snapshot), []);

  return { data, dispatch, isDirty, markSaved };
}
