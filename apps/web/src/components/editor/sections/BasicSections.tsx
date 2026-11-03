// ============================================================
// The simple, "object-shaped" parts of the CV: header, contact, summary,
// education, military. Each component receives only the slice of data it
// edits plus `dispatch` — a narrow props surface keeps components reusable
// and makes it obvious what they can change.
// ============================================================
import type { CvData, CvLanguage } from '@yishai-cv/shared';
import type { CvDispatch } from '../../../cvReducer.ts';
import { Section } from '../Section.tsx';
import { BoldHint, TextAreaField, TextField } from '../fields.tsx';

export function LanguageSection({ language, dispatch }: { language: CvLanguage; dispatch: CvDispatch }) {
  return (
    <Section title={`CV language — ${language === 'he' ? 'עברית (RTL)' : 'English'}`}>
      <fieldset className="radio-group">
        <legend className="field__label">Layout & section headings</legend>
        <label>
          <input
            type="radio"
            name="cvLanguage"
            checked={language === 'en'}
            onChange={() => dispatch({ type: 'language/set', language: 'en' })}
          />
          English (left-to-right)
        </label>
        <label>
          <input
            type="radio"
            name="cvLanguage"
            checked={language === 'he'}
            onChange={() => dispatch({ type: 'language/set', language: 'he' })}
          />
          עברית (right-to-left)
        </label>
      </fieldset>
      <p className="hint">This only changes the layout and fixed headings. The content you type stays as written.</p>
    </Section>
  );
}

export function HeaderSection({ header, dispatch }: { header: CvData['header']; dispatch: CvDispatch }) {
  return (
    <Section title="Header" defaultOpen>
      <div className="grid-2">
        <TextField
          label="First name"
          value={header.firstName}
          onChange={(firstName) => dispatch({ type: 'header/update', patch: { firstName } })}
        />
        <TextField
          label="Last name"
          value={header.lastName}
          onChange={(lastName) => dispatch({ type: 'header/update', patch: { lastName } })}
        />
      </div>
      {/* roleLines is an array, but editing it as "one line per role" in a textarea
          is the simplest UI: join for display, split on change. */}
      <TextAreaField
        label="Role lines (one per line — this is your headline)"
        rows={2}
        value={header.roleLines.join('\n')}
        onChange={(text) => dispatch({ type: 'header/update', patch: { roleLines: text.split('\n') } })}
      />
    </Section>
  );
}

export function ContactSection({ contact, dispatch }: { contact: CvData['contact']; dispatch: CvDispatch }) {
  return (
    <Section title="Contact">
      <TextField
        label="Email"
        type="email"
        value={contact.email}
        onChange={(email) => dispatch({ type: 'contact/update', patch: { email } })}
      />
      <TextField
        label="Phone"
        type="tel"
        value={contact.phone}
        onChange={(phone) => dispatch({ type: 'contact/update', patch: { phone } })}
      />
      <TextField
        label="LinkedIn (full URL)"
        type="url"
        value={contact.linkedin}
        onChange={(linkedin) => dispatch({ type: 'contact/update', patch: { linkedin } })}
      />
    </Section>
  );
}

export function SummarySection({ summary, dispatch }: { summary: string; dispatch: CvDispatch }) {
  return (
    <Section title="Summary" defaultOpen>
      <TextAreaField
        ariaLabel="Summary"
        rows={6}
        value={summary}
        showCount
        hint={<BoldHint />}
        onChange={(value) => dispatch({ type: 'summary/set', value })}
      />
    </Section>
  );
}

export function EducationSection({
  education,
  dispatch,
}: {
  education: CvData['education'];
  dispatch: CvDispatch;
}) {
  return (
    <Section title="Education">
      <TextField
        label="School"
        value={education.school}
        onChange={(school) => dispatch({ type: 'education/update', patch: { school } })}
      />
      <TextField
        label="Degree"
        value={education.degree}
        onChange={(degree) => dispatch({ type: 'education/update', patch: { degree } })}
      />
      <TextField
        label="Place"
        value={education.place}
        onChange={(place) => dispatch({ type: 'education/update', patch: { place } })}
      />
    </Section>
  );
}

export function MilitarySection({ military, dispatch }: { military: CvData['military']; dispatch: CvDispatch }) {
  return (
    <Section title="Military service">
      <TextField
        label="Title"
        value={military.title}
        onChange={(title) => dispatch({ type: 'military/update', patch: { title } })}
      />
      <TextField
        label="Detail"
        value={military.detail}
        onChange={(detail) => dispatch({ type: 'military/update', patch: { detail } })}
      />
    </Section>
  );
}
