import { describe, expect, it } from 'vitest';
import { formatDateTime } from './format.ts';

describe('formatDateTime', () => {
  it('treats SQLite timestamps without a zone as UTC', () => {
    expect(formatDateTime('2020-05-01 10:00:00')).toBe(formatDateTime('2020-05-01T10:00:00Z'));
  });

  it('shows the year only for other years', () => {
    expect(formatDateTime('2020-05-01T10:00:00Z')).toMatch(/2020/);
    const thisYear = new Date().getFullYear();
    expect(formatDateTime(`${thisYear}-05-01T10:00:00Z`)).not.toMatch(String(thisYear));
  });

  it('returns unparseable input unchanged', () => {
    expect(formatDateTime('not a date')).toBe('not a date');
  });
});
