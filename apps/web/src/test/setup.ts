// Runs before every test file (see `test.setupFiles` in vite.config.ts).
import '@testing-library/jest-dom/vitest'; // adds matchers like toBeInTheDocument()
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount whatever the previous test rendered (Vitest globals are off, so RTL can't do it automatically).
afterEach(() => cleanup());

// jsdom has no layout engine, so it doesn't implement ResizeObserver (used by useElementSize).
// A no-op stub is enough: sizes stay 0 and PreviewPane falls back to its default scale.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
