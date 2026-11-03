// Which CV the "Base CV" versions are seeded with, and what new versions start from.
// The repo only ships a demo CV (libs/shared). Your real one stays local, in gitignored
// JSON files next to the database: apps/api/data/base-cv.en.json and base-cv.he.json.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { baseCv, baseCvHe, type CvData, type CvLanguage } from '@yishai-cv/shared';
import { BASE_CV_DIR } from '../paths.ts';

const DEMO: Record<CvLanguage, CvData> = { en: baseCv, he: baseCvHe };

/** The file that overrides the demo CV for a language, or null when there is no data folder. */
export function baseCvFile(language: CvLanguage): string | null {
  return BASE_CV_DIR ? join(BASE_CV_DIR, `base-cv.${language}.json`) : null;
}

/** Read on every call, so edits to the JSON apply without restarting the API. */
export function loadBaseCv(language: CvLanguage = 'en'): CvData {
  const file = baseCvFile(language);
  if (!file || !existsSync(file)) return DEMO[language];
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as CvData;
  } catch (error) {
    throw new Error(`Could not read ${file}: ${(error as Error).message}`, { cause: error });
  }
}
