import { describe, expect, it } from 'vitest';
import { cvReducer, moveItem } from './cvReducer.ts';
import { makeCv } from './test/fixtures.ts';

describe('moveItem', () => {
  it('moves an item forwards and backwards', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns an unchanged copy for out-of-range indexes', () => {
    const list = ['a', 'b'];
    const result = moveItem(list, 0, 5);
    expect(result).toEqual(list);
    expect(result).not.toBe(list);
  });
});

describe('cvReducer', () => {
  it('never mutates the previous state', () => {
    const state = makeCv();
    const frozen = structuredClone(state);
    cvReducer(state, { type: 'skills/move', from: 0, to: 1 });
    cvReducer(state, { type: 'bullets/update', jobId: 'j1', groupId: 'g1', bulletId: 'b1', patch: { text: 'x' } });
    cvReducer(state, { type: 'header/update', patch: { firstName: 'Grace' } });
    expect(state).toEqual(frozen);
  });

  it('keeps untouched branches by reference (so React can skip them)', () => {
    const state = makeCv();
    const next = cvReducer(state, { type: 'summary/set', value: 'New' });
    expect(next.summary).toBe('New');
    expect(next.jobs).toBe(state.jobs);
    expect(next.skills).toBe(state.skills);
  });

  it('adds, updates, moves and removes skills', () => {
    let s = makeCv();
    s = cvReducer(s, { type: 'skills/add', id: 's4', label: 'Rust' });
    s = cvReducer(s, { type: 'skills/update', id: 's4', patch: { hidden: true } });
    s = cvReducer(s, { type: 'skills/move', from: 3, to: 0 });
    expect(s.skills[0]).toEqual({ id: 's4', label: 'Rust', hidden: true });
    s = cvReducer(s, { type: 'skills/remove', id: 's4' });
    expect(s.skills.map((x) => x.id)).toEqual(['s1', 's2', 's3']);
  });

  it('puts new jobs on top with an empty bullet group', () => {
    const s = cvReducer(makeCv(), { type: 'jobs/add', id: 'j2', groupId: 'g2' });
    expect(s.jobs.map((j) => j.id)).toEqual(['j2', 'j1']);
    expect(s.jobs[0]!.groups).toEqual([{ id: 'g2', bullets: [] }]);
  });

  it('edits nested bullets inside the right job and group only', () => {
    let s = makeCv();
    s = cvReducer(s, { type: 'bullets/add', jobId: 'j1', groupId: 'g1', id: 'b3' });
    s = cvReducer(s, { type: 'bullets/update', jobId: 'j1', groupId: 'g1', bulletId: 'b3', patch: { text: 'Third' } });
    s = cvReducer(s, { type: 'bullets/move', jobId: 'j1', groupId: 'g1', from: 2, to: 0 });
    expect(s.jobs[0]!.groups[0]!.bullets.map((b) => b.text)).toEqual([
      'Third',
      'Wrote the first program',
      'Secret bullet',
    ]);
    s = cvReducer(s, { type: 'bullets/remove', jobId: 'j1', groupId: 'g1', bulletId: 'b1' });
    expect(s.jobs[0]!.groups[0]!.bullets.map((b) => b.id)).toEqual(['b3', 'b2']);
  });

  it('switches the CV language', () => {
    expect(cvReducer(makeCv(), { type: 'language/set', language: 'he' }).language).toBe('he');
  });
});
