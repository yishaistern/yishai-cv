/// <reference types="vitest/config" />
import { defaultClientConditions, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite serves the React app on :5173 and forwards /api and /images to the NestJS API on :3001.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Import @yishai-cv/shared straight from its .ts sources, so edits there hot-reload
    // without rebuilding the library (see libs/shared/package.json "exports").
    conditions: ['@yishai-cv/source', ...defaultClientConditions],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/images': 'http://127.0.0.1:3001',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Vitest's own resolver also needs the source condition for @yishai-cv/shared.
    server: { deps: { inline: ['@yishai-cv/shared'] } },
  },
});
