import { join } from 'node:path';

// This file compiles to apps/api/dist/paths.js, so one level up is the app root (apps/api).
const APP_ROOT = join(import.meta.dirname, '..');

/** SQLite database file. Override with CV_DB_PATH. */
export const DB_PATH = process.env.CV_DB_PATH ?? join(APP_ROOT, 'data', 'cv.db');

/** Company logos referenced as "images/zoominfo.png" in the CV data live in <repo>/images. */
export const IMAGES_DIR = join(APP_ROOT, '..', '..', 'images');

/** The production build of the web app (`npx nx build web`). Served by the API when it exists. */
export const WEB_DIST_DIR = join(APP_ROOT, '..', 'web', 'dist');
