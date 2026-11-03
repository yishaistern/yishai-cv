import { useEffect, useRef, useState } from 'react';

/**
 * Measures a DOM element with ResizeObserver.
 *
 * REACT CONCEPT: refs to DOM nodes. `const ref = useRef<HTMLDivElement>(null)`
 * then `<div ref={ref}>` — after mount, ref.current is the real element.
 * Angular equivalent: @ViewChild('el') el: ElementRef.
 *
 * Usage: const [ref, { width, height }] = useElementSize<HTMLDivElement>();
 */
export function useElementSize<E extends HTMLElement>() {
  const ref = useRef<E>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Only set state when the size really changed, to avoid useless re-renders.
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // `as const` makes this a typed tuple [ref, size] instead of an array of unions.
  return [ref, size] as const;
}
