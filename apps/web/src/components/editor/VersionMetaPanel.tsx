import type { VersionSummary } from '@yishai-cv/shared';
import { Section } from './Section.tsx';
import { TextAreaField, TextField } from './fields.tsx';

/** The version's own fields (not part of the CV itself). Saved together with the CV by the Save button. */
export type VersionMeta = Pick<VersionSummary, 'name' | 'targetCompany' | 'targetRole' | 'description'>;

interface VersionMetaPanelProps {
  meta: VersionMeta;
  onChange: (meta: VersionMeta) => void;
}

// A fully controlled component: it renders `meta` and reports every change.
// The state itself lives in the parent (<Workspace>) — "lifting state up" —
// because the parent also needs it for dirty-checking and saving.
export function VersionMetaPanel({ meta, onChange }: VersionMetaPanelProps) {
  // Partial update helper: keep the other fields, replace one.
  const patch = (p: Partial<VersionMeta>) => onChange({ ...meta, ...p });

  return (
    <Section title="Version details" defaultOpen>
      <TextField label="Version name" value={meta.name} onChange={(name) => patch({ name })} />
      <div className="grid-2">
        <TextField
          label="Target company"
          value={meta.targetCompany}
          onChange={(targetCompany) => patch({ targetCompany })}
        />
        <TextField label="Target role" value={meta.targetRole} onChange={(targetRole) => patch({ targetRole })} />
      </div>
      <TextAreaField
        label="Notes (job link, fit %, why this version exists…)"
        rows={4}
        value={meta.description}
        onChange={(description) => patch({ description })}
      />
    </Section>
  );
}
