# CV Dashboard

A local editor for tailoring the CV to each job application. Each **version** is a named copy of the CV (for example "Buildots – Full-Stack Team Lead"). For each one you can change the headline and summary, reorder skills, reword or reorder bullets, and hide the bullets that don't matter for that job. Every save keeps a **revision**, so you can go back. The preview updates as you type, and **Print / PDF** gives you an A4 PDF that looks like `v3.html`.

## Run it

This is an [Nx](https://nx.dev) monorepo using npm workspaces. Run everything from the repo root:

```bash
npm install
npm run dev          # builds libs/shared, then starts the API (:3001) and Vite (:5173)
```

Then open http://localhost:5173.

| Command | What it does |
|---|---|
| `npm run dev` | `nx run-many -t dev`: NestJS API (`tsc --watch` + `node --watch`) and web (`vite`), both reload on change |
| `npm start` | Builds everything, then runs the API, which also serves the built web app at http://localhost:3001 |
| `npm test` | Every project's tests (see [Testing](#testing)) |
| `npm run lint` | [oxlint](https://oxc.rs) on the whole repo, warnings fail |
| `npm run typecheck` | `tsc --noEmit` in every project |
| `npm run check` | lint + typecheck + test + build: exactly what CI runs |
| `npm run seed` | **Resets** the database to the base CV (from `v3.html`) |
| `npm run build` | Production builds: `libs/shared/dist`, `apps/api/dist`, `apps/web/dist` |
| `npm run graph` | Opens the Nx project graph |
| `npx nx dev api` / `npx nx test web` / … | Run one target of one project |

Nx caches `build`, `typecheck` and `test`, and runs `^build` first, so `libs/shared` is always compiled before the API uses it.

**Network:** the API has no authentication, so it listens on `127.0.0.1` only. Set `HOST=0.0.0.0` to expose it on your network on purpose. `PORT` changes the port (default 3001).

**Database:** SQLite at `apps/api/data/cv.db` (override with `CV_DB_PATH`). It's created and seeded the first time the API starts. `data/` is in `.gitignore`, and `npm run seed` resets it.

### Workspace layout

```
apps/
  web/      React 19 + Vite dashboard            (Nx project "web")
  api/      NestJS 12 REST API + SQLite           (Nx project "api")
libs/
  shared/   @yishai-cv/shared: CvData types, REST contract, base CV
nx.json     task pipeline (build dependsOn ^build) + caching
index.html, v2.html, v3.html, images/   the static CV (logos are served by the API at /images)
```

`@yishai-cv/shared` is a workspace package. Vite and the web typecheck read its `.ts` sources directly (the `@yishai-cv/source` export condition), so edits hot-reload. The API imports its compiled `dist/`.

### API (NestJS)

```
apps/api/src/
  main.ts                        createApp(): /api prefix, 2mb JSON, validation, error filter, /images + built web app;
                                 bootstrap() listens on HOST (default 127.0.0.1):PORT
  app.module.ts                  DatabaseModule + VersionsModule
  paths.ts                       DB_PATH, IMAGES_DIR
  seed.ts                        `npm run seed` (standalone Nest application context)
  database/cv.repository.ts      node:sqlite storage: versions 1 ── * revisions (injectable)
  versions/versions.controller.ts  /api/versions/* and /api/revisions/:id
  versions/versions.service.ts     rules + 404s
  versions/versions.dto.ts         class-validator DTOs implementing the shared contract types
  versions/versions.e2e.test.ts    REST contract tests (node:test, in-memory SQLite)
  common/                        ParseIdPipe, BodyValidationPipe, ApiExceptionFilter ({ error } JSON)
```

It's compiled with plain `tsc` (`experimentalDecorators` + `emitDecoratorMetadata` for Nest's dependency injection) to ESM in `dist/`.

## Testing

| Project | Runner | What's covered |
|---|---|---|
| `web` | [Vitest](https://vitest.dev) + jsdom + Testing Library | `cvReducer` (immutability, every list action), `api.ts` error handling, `Markup` (bold + HTML escaping), `CvPreview` (hidden items, RTL), `SortableList`, and `Workspace` end to end: edit → dirty → ⌘S → saved |
| `api` | `node:test` | The whole REST contract over HTTP: boots the real Nest app against an in-memory SQLite database (`CV_DB_PATH=:memory:`), so it never touches `data/cv.db` |
| `shared` | `node:test` | The base CVs: unique ids, required content, logo files exist |

```bash
npm test                    # everything
npx nx test web             # one project
npm run test:watch -w web   # Vitest watch mode
```

Tests sit next to the code they test (`*.test.ts(x)`). Shared test fixtures for the web app are in `apps/web/src/test/`.

**CI:** `.github/workflows/ci.yml` runs `npm run check` on every push to `main` and on every pull request.

**Linting:** oxlint instead of ESLint, because `typescript-eslint` doesn't support TypeScript 7 yet. oxlint also ships the React Compiler rules natively (`purity`, `refs`, `globals`, `immutability`, `set-state-in-effect`…), plus `jsx-a11y`. Config: `.oxlintrc.json`.

**Keyboard:** <kbd>⌘S</kbd> / <kbd>Ctrl+S</kbd> saves.
**Markup:** wrap text in `**double asterisks**` to make it **bold** in the CV.

## Architecture

```
 Browser  http://localhost:5173   (apps/web)
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ main.tsx ─ <StrictMode><ErrorBoundary><ToastProvider><App/>               │
 │                                                                           │
 │ App.tsx                                                                    │
 │  ├─ ?print=<id>[&rev=<rid>] → <PrintView>  (only the CV, auto window.print)│
 │  └─ otherwise <Dashboard>   state: versions[], selectedId, current, dirty  │
 │      ├─ <VersionsSidebar>   list · select · new · delete        (column 1) │
 │      └─ <Workspace key=…>   useCvDocument → useReducer(cvReducer)          │
 │           ├─ toolbar        Save (+note) · ⌘S · Print/PDF · dirty badge    │
 │           ├─ editor panels  (column 2)                                     │
 │           │   VersionMetaPanel · HistoryPanel · Header · Summary · Skills  │
 │           │   Jobs → Groups → Bullets · Strengths · Contact · Education …  │
 │           │        └── all lists use <SortableList<T>>                     │
 │           └─ <PreviewPane>  (column 3) scale(…) ─▶ <CvPreview data/>       │
 │                                                                           │
 │ api.ts  typed fetch wrapper ── /api/*, /images/* ──┐                       │
 └────────────────────────────────────────────────────┼──────────────────────┘
                                   Vite dev proxy      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ apps/api  NestJS :3001  ── REST spec in libs/shared/src/types.ts          │
 │   versions (id, name, meta, data JSON) 1 ── * revisions (note, data JSON) │
 │   SQLite: apps/api/data/cv.db   static: <repo>/images → /images/*         │
 └──────────────────────────────────────────────────────────────────────────┘
 libs/shared — CvData, Version, Revision + the API contract (used by both sides)
```

Data flow: `Workspace` owns the draft `CvData` in a reducer. Editor panels get slices of it plus `dispatch`. `PreviewPane` gets the same `data`, so every change appears in the preview right away. **Save** sends `PUT /api/versions/:id` with the meta fields, and with `data` + `note` too when the CV changed (that creates a revision). Dirty state comes from comparing the draft with the last saved snapshot.

### Web folder map

```
apps/web/src/
  main.tsx                 mount + providers
  App.tsx                  print mode vs dashboard, versions list/selection
  api.ts                   fetch wrapper (throws ApiError with the server's {error})
  cvReducer.ts             all CV edits as typed actions (pure reducer)
  app.css                  dashboard styles (scoped under .app / body.print-mode)
  test/                    Vitest setup + shared fixtures (makeCv, makeVersion)
  hooks/                   useCvDocument, useToast (context), useKeyboardShortcut,
                           useBeforeUnload, useElementSize
  components/ErrorBoundary.tsx  crash fallback around the whole app
  components/editor/       Workspace, VersionsSidebar, VersionMetaPanel, HistoryPanel,
                           PreviewPane, PrintView, SortableList, Section, fields
  components/editor/sections/  BasicSections, ListSections, JobsSection
  components/preview/      CvPreview + Markup + cv.css (the A4 CV itself)
```

## React concepts used in this project: where to look

| Concept | What it is (Angular analogy) | Where to look |
|---|---|---|
| **Components & props** | Functions that take a props object and return JSX (`@Input()`) | `components/editor/fields.tsx`, `VersionMetaPanel.tsx`, `preview/CvPreview.tsx` |
| **Callback props** | A child reports events by calling a function prop (`@Output()` + `EventEmitter`) | `SortableList.tsx` (`onMove`), `Workspace.tsx` (`onSaved`, `onDirtyChange`) |
| **children** | Nested JSX passed in (`<ng-content>`) | `Section.tsx`, `hooks/useToast.tsx` (`ToastProvider`) |
| **useState** | Local component state; the setter triggers a re-render | `Section.tsx` (open/closed), `VersionsSidebar.tsx` (form object), `App.tsx` |
| **Functional updates** | `setX(prev => next)` when the new state depends on the old one | `App.tsx` (`setVersions(list => …)`), `useToast.tsx` |
| **Lazy initial state** | `useState(() => compute())` runs only once | `Workspace.tsx` (`metaOf(version)`), `App.tsx` (localStorage) |
| **useReducer** | Pure `(state, action) => state` with typed actions (NgRx reducer) | `cvReducer.ts`, used in `hooks/useCvDocument.ts` |
| **Immutability** | Return new objects/arrays so React sees the change | `cvReducer.ts` (`moveItem`, `updateById`, spreads) |
| **useEffect** | Side effects after render, with cleanup (`ngOnInit`/`ngOnDestroy`, tied to deps) | `App.tsx` (fetching), `HistoryPanel.tsx` (race-safe fetch), `PrintView.tsx` |
| **Effect cleanup** | The returned function unsubscribes or cancels | `useKeyboardShortcut.ts`, `useBeforeUnload.ts`, `useElementSize.ts` |
| **Custom hooks** | Reusable stateful logic in a `useX` function (a service with lifecycle) | `hooks/` (all), e.g. `useCvDocument`, `useElementSize` |
| **useRef** | A mutable box that doesn't re-render, or a DOM handle (`@ViewChild`) | `useElementSize.ts` (DOM), `useToast.tsx` (timer handles), `PrintView.tsx` |
| **useEffectEvent** | A function an effect calls that always sees the latest props/state, without being a dependency (React 19.2) | `useKeyboardShortcut.ts` |
| **Context** | Share a value with all descendants without passing props down (a provided service). React 19 renders `<Ctx value>` directly as the provider | `hooks/useToast.tsx` |
| **useMemo / useCallback** | Cache a value or keep a function's identity stable between renders | `useCvDocument.ts` (dirty check), `useToast.tsx`, `App.tsx` (`handleSaved`) |
| **useId** | Stable unique ids for label/input pairs | `fields.tsx`, `Section.tsx`, `SortableList.tsx` |
| **Render props** | Pass a function that renders each item (`<ng-template>` + `ngTemplateOutlet`) | `SortableList.tsx`; used in `ListSections.tsx`, `JobsSection.tsx` |
| **Generic components** | `function SortableList<T extends {id:string}>`: T is inferred from `items` | `SortableList.tsx` |
| **Keys** | Stable `key={item.id}` so React matches list items to DOM nodes across reorders | `SortableList.tsx`, `VersionsSidebar.tsx`, `HistoryPanel.tsx` |
| **key to reset state** | Changing `key` remounts a component with fresh state | `App.tsx` → `<Workspace key={`${id}:${nonce}`}>` |
| **Controlled inputs** | `value` + `onChange`; React state is the source of truth (`[ngModel]` + `(ngModelChange)`) | `fields.tsx`, every section in `sections/` |
| **Forms** | `onSubmit(e: SubmitEvent<HTMLFormElement>)` + `e.preventDefault()`, one state object for the form | `VersionsSidebar.tsx` (`NewVersionForm`), `ListSections.tsx` (add skill) |
| **Lifting state up** | State lives in the closest common parent, and children get it via props | `Workspace.tsx` (CV data shared by the editor and the preview), `App.tsx` (dirty flag) |
| **Derived state** | Compute from existing state instead of storing a copy | `useCvDocument.ts` (`isDirty`), `PreviewPane.tsx` (`scale`) |
| **Conditional rendering** | `cond && <X/>`, ternaries, early `return` (`@if` / `*ngIf`) | `Section.tsx`, `JobsSection.tsx` (highlight), `HistoryPanel.tsx`, `App.tsx` |
| **Rules of hooks** | Hooks run at the top level, never inside conditions or callbacks | `App.tsx` (print vs dashboard split), `JobsSection.tsx` (`JobEditor` extracted) |
| **Discriminated unions** | `action.type` narrows the action; `never` makes TypeScript check every case is handled | `cvReducer.ts` |
| **StrictMode** | Dev-only double render/effects to catch impurity | `main.tsx`, `PrintView.tsx` (`printed` ref guard) |
| **Error boundaries** | Catch render errors below and show a fallback (the one remaining use for a class component) | `components/ErrorBoundary.tsx`, used in `main.tsx` |
| **Document metadata** | Render `<title>` anywhere; React 19 hoists it into `<head>` | `Workspace.tsx` (version name + unsaved dot), `PrintView.tsx` (PDF file name) |
