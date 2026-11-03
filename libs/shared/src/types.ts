// ============================================================
// Shared contract between the React app (src/) and the API (server/).
// Text fields support a tiny markup: **bold** renders as <strong>.
// Every list item has a stable `id` so React can key it and so it can be reordered.
// `hidden: true` keeps an item in the data but leaves it out of the CV.
// ============================================================

export type Id = string;

export interface Skill { id: Id; label: string; hidden?: boolean }

export interface Bullet { id: Id; text: string; hidden?: boolean }

/** A group of bullets inside a job. heading is optional (e.g. "Key AI & Developer Productivity Initiatives"). */
export interface BulletGroup { id: Id; heading?: string; bullets: Bullet[] }

export interface Highlight { label: string; text: string }

export interface Job {
  id: Id;
  title: string;
  company: string;        // e.g. "ZoomInfo — Productivity Engineering"
  logo?: string;          // e.g. "images/zoominfo.png" (served by the API at /images/...)
  dates: string;          // e.g. "2024 – Present"
  groups: BulletGroup[];
  highlight?: Highlight;  // the blue box under a job
  pageBreakBefore?: boolean; // start this job on page 2 when printing
  hidden?: boolean;
}

export interface Strength { id: Id; label: string; text: string; hidden?: boolean }

export interface Language { id: Id; name: string; level: string }

/** The language the CV itself is written in. 'he' renders right-to-left with Hebrew section headings. */
export type CvLanguage = 'en' | 'he';
export const CV_LANGUAGES: readonly CvLanguage[] = ['en', 'he'];

export interface CvData {
  language?: CvLanguage; // missing = 'en' (data saved before this field existed)
  header: { firstName: string; lastName: string; roleLines: string[] }; // roleLines render one per line under the name
  contact: { email: string; phone: string; linkedin: string };          // linkedin = full URL
  summary: string;
  skills: Skill[];
  education: { school: string; degree: string; place: string };
  languages: Language[];
  military: { title: string; detail: string };
  jobs: Job[];
  strengths: Strength[];
}

/** A named, tailored CV (e.g. "Buildots – Full-Stack Team Lead"). Stored in the `versions` table. */
export interface VersionSummary {
  id: number;
  name: string;
  description: string;   // free text: why this version exists, fit notes, link to job post...
  targetCompany: string;
  targetRole: string;
  createdAt: string;     // ISO
  updatedAt: string;     // ISO
}

export interface Version extends VersionSummary { data: CvData }

/** Every save of a version's data writes a revision row, so you can go back in time. */
export interface RevisionSummary { id: number; versionId: number; note: string; createdAt: string }
export interface Revision extends RevisionSummary { data: CvData }

// ---------------- REST API (NestJS on :3001, proxied by Vite under /api) ----------------
// GET    /api/versions                         -> VersionSummary[]   (ordered by updatedAt desc)
// GET    /api/versions/:id                     -> Version
// POST   /api/versions                         body: CreateVersionBody -> Version (201)
// PUT    /api/versions/:id                     body: UpdateVersionBody -> Version
//                                              (if `data` is present, also inserts a revision with `note`)
// DELETE /api/versions/:id                     -> 204 (revisions cascade)
// GET    /api/versions/:id/revisions           -> RevisionSummary[] (newest first)
// GET    /api/revisions/:id                    -> Revision
// POST   /api/versions/:id/restore/:revisionId -> Version (copies revision data into the version + new revision "Restored from #N")
// GET    /images/*                             -> static files from ../images
// Errors: { error: string } with 4xx/5xx status.

export interface CreateVersionBody {
  name: string;
  description?: string;
  targetCompany?: string;
  targetRole?: string;
  fromVersionId?: number; // duplicate this version's data; otherwise start from the seed/base CV
  language?: CvLanguage;  // when NOT duplicating: which base CV to start from (default 'en')
}

export interface UpdateVersionBody {
  name?: string;
  description?: string;
  targetCompany?: string;
  targetRole?: string;
  data?: CvData;
  note?: string; // revision note, e.g. "reordered skills for Buildots"
}
