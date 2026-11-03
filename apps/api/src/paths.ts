import { dirname, join } from 'node:path';

// This file compiles to apps/api/dist/paths.js, so one level up is the app root (apps/api).
const APP_ROOT = join(import.meta.dirname, '..');

/** SQLite database file. Override with CV_DB_PATH. */
export const DB_PATH = process.env.CV_DB_PATH ?? join(APP_ROOT, 'data', 'cv.db');

/**
 * Your real base CV lives next to the database (gitignored), as base-cv.en.json / base-cv.he.json.
 * When a file is missing, the demo CV from @yishai-cv/shared is used instead.
 * An in-memory database (tests) has no folder, so tests always get the demo CV.
 */
export const BASE_CV_DIR = DB_PATH === ':memory:' ? null : dirname(DB_PATH);

/** Company logos referenced as "images/sample-northwind.svg" in the CV data live in <repo>/images. */
export const IMAGES_DIR = join(APP_ROOT, '..', '..', 'images');

/** The production build of the web app (`npx nx build web`). Served by the API when it exists. */
export const WEB_DIST_DIR = join(APP_ROOT, '..', 'web', 'dist');
