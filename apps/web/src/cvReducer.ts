// ============================================================
// cvReducer — every change to the CV document goes through here.
//
// REACT CONCEPT: useReducer
//   const [data, dispatch] = useReducer(cvReducer, initialData);
//   dispatch({ type: 'skills/move', from: 2, to: 0 });
// A reducer is a PURE function (state, action) => newState. It must not
// mutate `state`, call APIs, or generate random values: React may call it
// twice in StrictMode (dev) to catch impurities. That's why new ids are
// created by the *caller* (crypto.randomUUID() at dispatch time) and passed
// inside the action.
//
// Angular equivalent: very close to an NgRx reducer + a discriminated-union
// of actions — minus the store/effects boilerplate.
//
// IMMUTABILITY: React decides whether to re-render by comparing references
// (Object.is). So we always return *new* objects/arrays for anything that
// changed ({...obj}, arr.map, arr.filter, toSpliced...) and reuse the old
// references for anything that didn't.
// ============================================================
import type {
  BulletGroup,
  Bullet,
  CvData,
  Id,
  Job,
  Language,
  Skill,
  Strength,
} from '@yishai-cv/shared';

// ---------- action types (a discriminated union on `type`) ----------

type Header = CvData['header'];
type Contact = CvData['contact'];
type Education = CvData['education'];
type Military = CvData['military'];

/** Editable fields of a job (lists are edited through their own actions). */
export type JobPatch = Partial<Omit<Job, 'id' | 'groups'>>;

export type CvAction =
  // replace the whole document (e.g. after loading from the server)
  | { type: 'load'; data: CvData }
  // simple objects
  | { type: 'header/update'; patch: Partial<Header> }
  | { type: 'contact/update'; patch: Partial<Contact> }
  | { type: 'education/update'; patch: Partial<Education> }
  | { type: 'military/update'; patch: Partial<Military> }
  | { type: 'summary/set'; value: string }
  // skills
  | { type: 'skills/add'; id: Id; label: string }
  | { type: 'skills/update'; id: Id; patch: Partial<Omit<Skill, 'id'>> }
  | { type: 'skills/remove'; id: Id }
  | { type: 'skills/move'; from: number; to: number }
  // core strengths
  | { type: 'strengths/add'; id: Id }
  | { type: 'strengths/update'; id: Id; patch: Partial<Omit<Strength, 'id'>> }
  | { type: 'strengths/remove'; id: Id }
  | { type: 'strengths/move'; from: number; to: number }
  // languages
  | { type: 'languages/add'; id: Id }
  | { type: 'languages/update'; id: Id; patch: Partial<Omit<Language, 'id'>> }
  | { type: 'languages/remove'; id: Id }
  | { type: 'languages/move'; from: number; to: number }
  // jobs
  | { type: 'jobs/add'; id: Id; groupId: Id }
  | { type: 'jobs/update'; id: Id; patch: JobPatch }
  | { type: 'jobs/remove'; id: Id }
  | { type: 'jobs/move'; from: number; to: number }
  // bullet groups inside a job
  | { type: 'groups/add'; jobId: Id; id: Id }
  | { type: 'groups/update'; jobId: Id; groupId: Id; heading: string | undefined }
  | { type: 'groups/remove'; jobId: Id; groupId: Id }
  | { type: 'groups/move'; jobId: Id; from: number; to: number }
  // bullets inside a group
  | { type: 'bullets/add'; jobId: Id; groupId: Id; id: Id }
  | { type: 'bullets/update'; jobId: Id; groupId: Id; bulletId: Id; patch: Partial<Omit<Bullet, 'id'>> }
  | { type: 'bullets/remove'; jobId: Id; groupId: Id; bulletId: Id }
  | { type: 'bullets/move'; jobId: Id; groupId: Id; from: number; to: number };

/** Handy alias for the `dispatch` function components receive as a prop. */
export type CvDispatch = (action: CvAction) => void;

// ---------- small immutable list helpers (generic, reused by every list) ----------

/** Return a new array with the item at `from` moved to index `to`. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length || to < 0 || to >= list.length) return [...list];
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// NoInfer: infer T from `list` only (otherwise TS may infer it from the narrower `patch`).
function updateById<T extends { id: Id }>(list: readonly T[], id: Id, patch: Partial<NoInfer<T>>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeById<T extends { id: Id }>(list: readonly T[], id: Id): T[] {
  return list.filter((item) => item.id !== id);
}

/** Apply `fn` to one job's groups (used by the nested group/bullet actions). */
function updateJobGroups(state: CvData, jobId: Id, fn: (groups: BulletGroup[]) => BulletGroup[]): CvData {
  return {
    ...state,
    jobs: state.jobs.map((job) => (job.id === jobId ? { ...job, groups: fn(job.groups) } : job)),
  };
}

/** Apply `fn` to one group's bullets. */
function updateGroupBullets(
  state: CvData,
  jobId: Id,
  groupId: Id,
  fn: (bullets: Bullet[]) => Bullet[],
): CvData {
  return updateJobGroups(state, jobId, (groups) =>
    groups.map((g) => (g.id === groupId ? { ...g, bullets: fn(g.bullets) } : g)),
  );
}

// ---------- the reducer ----------

export function cvReducer(state: CvData, action: CvAction): CvData {
  // TypeScript narrows `action` inside each `case`, so e.g. `action.from` only
  // exists where the action type actually has it.
  switch (action.type) {
    case 'load':
      return action.data;

    case 'header/update':
      return { ...state, header: { ...state.header, ...action.patch } };
    case 'contact/update':
      return { ...state, contact: { ...state.contact, ...action.patch } };
    case 'education/update':
      return { ...state, education: { ...state.education, ...action.patch } };
    case 'military/update':
      return { ...state, military: { ...state.military, ...action.patch } };
    case 'summary/set':
      return { ...state, summary: action.value };

    case 'skills/add':
      return { ...state, skills: [...state.skills, { id: action.id, label: action.label }] };
    case 'skills/update':
      return { ...state, skills: updateById(state.skills, action.id, action.patch) };
    case 'skills/remove':
      return { ...state, skills: removeById(state.skills, action.id) };
    case 'skills/move':
      return { ...state, skills: moveItem(state.skills, action.from, action.to) };

    case 'strengths/add':
      return { ...state, strengths: [...state.strengths, { id: action.id, label: '', text: '' }] };
    case 'strengths/update':
      return { ...state, strengths: updateById(state.strengths, action.id, action.patch) };
    case 'strengths/remove':
      return { ...state, strengths: removeById(state.strengths, action.id) };
    case 'strengths/move':
      return { ...state, strengths: moveItem(state.strengths, action.from, action.to) };

    case 'languages/add':
      return { ...state, languages: [...state.languages, { id: action.id, name: '', level: '' }] };
    case 'languages/update':
      return { ...state, languages: updateById(state.languages, action.id, action.patch) };
    case 'languages/remove':
      return { ...state, languages: removeById(state.languages, action.id) };
    case 'languages/move':
      return { ...state, languages: moveItem(state.languages, action.from, action.to) };

    case 'jobs/add': {
      const job: Job = {
        id: action.id,
        title: 'New position',
        company: '',
        dates: '',
        groups: [{ id: action.groupId, bullets: [] }],
      };
      // New jobs go on top — the CV is reverse-chronological.
      return { ...state, jobs: [job, ...state.jobs] };
    }
    case 'jobs/update':
      return { ...state, jobs: updateById(state.jobs, action.id, action.patch) };
    case 'jobs/remove':
      return { ...state, jobs: removeById(state.jobs, action.id) };
    case 'jobs/move':
      return { ...state, jobs: moveItem(state.jobs, action.from, action.to) };

    case 'groups/add':
      return updateJobGroups(state, action.jobId, (groups) => [
        ...groups,
        { id: action.id, heading: 'New group', bullets: [] },
      ]);
    case 'groups/update':
      return updateJobGroups(state, action.jobId, (groups) =>
        groups.map((g) => (g.id === action.groupId ? { ...g, heading: action.heading } : g)),
      );
    case 'groups/remove':
      return updateJobGroups(state, action.jobId, (groups) => removeById(groups, action.groupId));
    case 'groups/move':
      return updateJobGroups(state, action.jobId, (groups) => moveItem(groups, action.from, action.to));

    case 'bullets/add':
      return updateGroupBullets(state, action.jobId, action.groupId, (bullets) => [
        ...bullets,
        { id: action.id, text: '' },
      ]);
    case 'bullets/update':
      return updateGroupBullets(state, action.jobId, action.groupId, (bullets) =>
        updateById(bullets, action.bulletId, action.patch),
      );
    case 'bullets/remove':
      return updateGroupBullets(state, action.jobId, action.groupId, (bullets) =>
        removeById(bullets, action.bulletId),
      );
    case 'bullets/move':
      return updateGroupBullets(state, action.jobId, action.groupId, (bullets) =>
        moveItem(bullets, action.from, action.to),
      );

    default: {
      // Exhaustiveness check: if a new action type is added to CvAction but not
      // handled above, this line becomes a compile error.
      const unhandled: never = action;
      return unhandled;
    }
  }
}
