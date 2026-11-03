import { Fragment } from 'react';
import type { CvData, CvLanguage, Job, BulletGroup, Highlight } from '@yishai-cv/shared';
import { Markup } from './Markup.tsx';
// Importing a CSS file from a component makes Vite bundle it with the app.
// All rules inside are scoped under .cv-root (see cv.css).
import './cv.css';

// ------------------------------------------------------------
// Fixed section headings, per CV language
// ------------------------------------------------------------

const LABELS = {
  en: {
    contact: 'Contact',
    techStack: 'Tech Stack',
    education: 'Education',
    languages: 'Languages',
    military: 'Military Service',
    experience: 'Experience',
    strengths: 'Core Strengths',
  },
  he: {
    contact: 'פרטי קשר',
    techStack: 'טכנולוגיות',
    education: 'השכלה',
    languages: 'שפות',
    military: 'שירות צבאי',
    experience: 'ניסיון תעסוקתי',
    strengths: 'חוזקות מרכזיות',
  },
} satisfies Record<CvLanguage, Record<string, string>>;

type Labels = (typeof LABELS)['en'];

// ------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------

/** "https://linkedin.com/in/x" -> "linkedin.com/in/x" (nicer as link text). */
function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

/** "images/zoominfo.png" -> "/images/zoominfo.png", so it works from any route. */
function resolveLogo(src: string): string {
  if (src.startsWith('/') || src.startsWith('http')) return src;
  return `/${src}`;
}

/** Labels are shown as "Label:" — add the colon unless the data already has it. */
function withColon(label: string): string {
  return label.trimEnd().endsWith(':') ? label : `${label}:`;
}

// ------------------------------------------------------------
// Sidebar (left dark column)
// ------------------------------------------------------------

function Sidebar({ data, t }: { data: CvData; t: Labels }) {
  const { header, contact, skills, education, languages, military } = data;

  return (
    <aside className="sidebar">
      <div className="name">
        <span className="first">{header.firstName}</span>
        <span className="last">{header.lastName}</span>
      </div>

      <div className="role-title">
        {/* Join lines with <br/>: put a <br/> before every line except the first.
            Each item in a mapped array needs a unique `key` so React can track it. */}
        {header.roleLines.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </div>

      <div className="accent-line"></div>

      <div className="side-section">
        <div className="side-label">{t.contact}</div>

        <div className="contact-row">
          <span className="contact-icon">@</span>
          <a href={`mailto:${contact.email}`} dir="ltr">
            {contact.email}
          </a>
        </div>

        <div className="contact-row">
          <span className="contact-icon">T</span>
          <span dir="ltr">{contact.phone}</span>
        </div>

        <div className="contact-row">
          <span className="contact-icon">in</span>
          <a href={contact.linkedin} target="_blank" rel="noopener" dir="ltr">
            {stripProtocol(contact.linkedin)}
          </a>
        </div>
      </div>

      <div className="side-section">
        <div className="side-label">{t.techStack}</div>
        <div className="tag-list">
          {/* .filter() drops hidden items, then .map() turns each one into JSX.
              We use the item's stable `id` as the key (better than the index,
              because skills can be reordered in the editor). */}
          {skills
            .filter((skill) => !skill.hidden)
            .map((skill) => (
              <span key={skill.id} className="tag">
                {skill.label}
              </span>
            ))}
        </div>
      </div>

      <div className="side-section">
        <div className="side-label">{t.education}</div>
        <div className="edu-name">{education.school}</div>
        <div className="edu-detail">{education.degree}</div>
        <div className="edu-place">{education.place}</div>
      </div>

      <div className="side-section">
        <div className="side-label">{t.languages}</div>
        {languages.map((lang) => (
          <div key={lang.id} className="lang-row">
            <span>{lang.name}</span>
            <em>{lang.level}</em>
          </div>
        ))}
      </div>

      <div className="side-section">
        <div className="side-label">{t.military}</div>
        <div className="mil-name">{military.title}</div>
        <div className="mil-detail">{military.detail}</div>
      </div>
    </aside>
  );
}

// ------------------------------------------------------------
// Main content pieces
// ------------------------------------------------------------

/** The blue box: "<strong>Label:</strong> text". Used by jobs and Core Strengths. */
function HighlightBox({ highlight }: { highlight: Highlight }) {
  return (
    <div className="highlight">
      <strong>{withColon(highlight.label)}</strong> <Markup text={highlight.text} />
    </div>
  );
}

/** One bullet group: optional sub-heading + a <ul> of visible bullets. */
function BulletGroupBlock({ group }: { group: BulletGroup }) {
  const visible = group.bullets.filter((b) => !b.hidden);

  // Returning null renders nothing — a group with no visible bullets disappears
  // entirely (including its heading).
  if (visible.length === 0) return null;

  return (
    <>
      {/* `cond && <X/>` renders <X/> only when cond is truthy. */}
      {group.heading && <div className="sub-heading">{group.heading}</div>}
      <ul>
        {visible.map((bullet) => (
          <li key={bullet.id}>
            <Markup text={bullet.text} />
          </li>
        ))}
      </ul>
    </>
  );
}

function JobBlock({ job }: { job: Job }) {
  return (
    <div className="job">
      <div className="job-top">
        <div className="job-title">{job.title}</div>
        <div className="date-badge">{job.dates}</div>
      </div>

      <div className="company-row">
        {job.logo && <img src={resolveLogo(job.logo)} alt={job.company} className="company-icon" />}
        <span className="company-name">{job.company}</span>
      </div>

      {job.groups.map((group) => (
        <BulletGroupBlock key={group.id} group={group} />
      ))}

      {job.highlight && <HighlightBox highlight={job.highlight} />}
    </div>
  );
}

// ------------------------------------------------------------
// The whole CV
// ------------------------------------------------------------

/**
 * Renders a CvData object as the A4 CV (same look as v3.html).
 * It is a pure function of its props: same `data` in, same markup out —
 * so the editor can pass in live, unsaved data and the preview just updates.
 */
export function CvPreview({ data }: { data: CvData }) {
  const jobs = data.jobs.filter((job) => !job.hidden);
  const strengths = data.strengths.filter((s) => !s.hidden);
  const lang = data.language ?? 'en';
  const t = LABELS[lang];

  return (
    // dir="rtl" flips the whole layout for Hebrew: sidebar on the right, bullets on the right, etc.
    // cv.css uses logical properties (padding-inline-start…) so it works both ways.
    <div className="cv-root" lang={lang} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="page">
        <Sidebar data={data} t={t} />

        <main className="content">
          <div className="top-accent"></div>

          <p className="summary">
            <Markup text={data.summary} />
          </p>

          <div className="section-heading">{t.experience}</div>

          {jobs.map((job) => (
            // A Fragment with a key lets one array item render two siblings
            // (the optional page-break div + the job itself).
            <Fragment key={job.id}>
              {job.pageBreakBefore && <div className="page-break" style={{ paddingTop: 25 }}></div>}
              <JobBlock job={job} />
            </Fragment>
          ))}

          {strengths.length > 0 && (
            <>
              <div className="section-heading" style={{ marginTop: 34 }}>
                {t.strengths}
              </div>
              {strengths.map((s) => (
                <HighlightBox key={s.id} highlight={s} />
              ))}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
