import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeCv } from '../../test/fixtures.ts';
import { CvPreview } from './CvPreview.tsx';

describe('<CvPreview>', () => {
  it('leaves hidden skills and bullets out of the CV', () => {
    render(<CvPreview data={makeCv()} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('COBOL')).toBeNull();
    expect(screen.getByText('Wrote the first program')).toBeInTheDocument();
    expect(screen.queryByText('Secret bullet')).toBeNull();
  });

  it('leaves hidden jobs out entirely', () => {
    const cv = makeCv();
    render(<CvPreview data={{ ...cv, jobs: cv.jobs.map((j) => ({ ...j, hidden: true })) }} />);
    expect(screen.queryByText('Engines Ltd')).toBeNull();
  });

  it('renders Hebrew CVs right-to-left with Hebrew headings', () => {
    const { container } = render(<CvPreview data={makeCv({ language: 'he' })} />);
    const root = container.querySelector('.cv-root');
    expect(root).toHaveAttribute('dir', 'rtl');
    expect(root).toHaveAttribute('lang', 'he');
    expect(screen.getByText('ניסיון תעסוקתי')).toBeInTheDocument();
  });

  it('defaults to English for data saved before the language field existed', () => {
    const { container } = render(<CvPreview data={makeCv()} />);
    expect(container.querySelector('.cv-root')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });
});
