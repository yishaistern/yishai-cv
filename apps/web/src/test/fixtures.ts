import type { CvData, Version } from '@yishai-cv/shared';

/** A small CvData for tests: one of everything, with stable ids. */
export function makeCv(overrides: Partial<CvData> = {}): CvData {
  return {
    header: { firstName: 'Ada', lastName: 'Lovelace', roleLines: ['Engineer'] },
    contact: { email: 'ada@example.com', phone: '+1 555 0100', linkedin: 'https://linkedin.com/in/ada' },
    summary: 'Builds **analytical** engines.',
    skills: [
      { id: 's1', label: 'TypeScript' },
      { id: 's2', label: 'React' },
      { id: 's3', label: 'COBOL', hidden: true },
    ],
    education: { school: 'University', degree: 'BSc', place: 'London' },
    languages: [{ id: 'l1', name: 'English', level: 'Native' }],
    military: { title: 'None', detail: '' },
    jobs: [
      {
        id: 'j1',
        title: 'Lead',
        company: 'Engines Ltd',
        dates: '1840 – 1843',
        groups: [
          {
            id: 'g1',
            bullets: [
              { id: 'b1', text: 'Wrote the first program' },
              { id: 'b2', text: 'Secret bullet', hidden: true },
            ],
          },
        ],
      },
    ],
    strengths: [{ id: 'st1', label: 'Vision', text: 'Saw beyond numbers' }],
    ...overrides,
  };
}

export function makeVersion(overrides: Partial<Version> = {}): Version {
  return {
    id: 1,
    name: 'Base CV',
    description: '',
    targetCompany: '',
    targetRole: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    data: makeCv(),
    ...overrides,
  };
}
