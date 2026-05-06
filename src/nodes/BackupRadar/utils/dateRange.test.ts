import { describe, it, expect } from 'vitest';
import { PRESET_MAP, resolveDateRange, chunkDateRange } from './dateRange.js';

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('PRESET_MAP', () => {
  it('contains 35 entries', () => {
    expect(Object.keys(PRESET_MAP).length).toBe(35);
  });
  it('today = 0', () => expect(PRESET_MAP['today']).toBe(0));
  it('last-1-day = 1', () => expect(PRESET_MAP['last-1-day']).toBe(1));
  it('last-31-days = 31', () => expect(PRESET_MAP['last-31-days']).toBe(31));
  it('last-45-days = 45', () => expect(PRESET_MAP['last-45-days']).toBe(45));
  it('last-60-days = 60', () => expect(PRESET_MAP['last-60-days']).toBe(60));
  it('last-90-days = 90', () => expect(PRESET_MAP['last-90-days']).toBe(90));
});

const NOW = new Date('2026-05-06T00:00:00.000Z');

describe('resolveDateRange — preset', () => {
  it('today → undefined startDate, totalDays 0', () => {
    const r = resolveDateRange('preset', { preset: 'today' }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(0);
    expect(r.endDate).toBe(NOW);
  });

  it('last-7-days → undefined startDate, totalDays 7', () => {
    const r = resolveDateRange('preset', { preset: 'last-7-days' }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(7);
  });

  it('last-31-days → undefined startDate, totalDays 31', () => {
    const r = resolveDateRange('preset', { preset: 'last-31-days' }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(31);
  });

  it('last-45-days → startDate 2026-03-22, totalDays 45', () => {
    const r = resolveDateRange('preset', { preset: 'last-45-days' }, NOW);
    expect(r.startDate).toBeDefined();
    expect(r.totalDays).toBe(45);
    expect(localDateStr(r.startDate!)).toBe('2026-03-22');
  });

  it('last-90-days → startDate 2026-02-05, totalDays 90', () => {
    const r = resolveDateRange('preset', { preset: 'last-90-days' }, NOW);
    expect(r.startDate).toBeDefined();
    expect(r.totalDays).toBe(90);
    expect(localDateStr(r.startDate!)).toBe('2026-02-05');
  });
});

describe('resolveDateRange — daysBack', () => {
  it('0 → undefined startDate, totalDays 0', () => {
    const r = resolveDateRange('daysBack', { daysBack: 0 }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(0);
  });

  it('14 → undefined startDate, totalDays 14', () => {
    const r = resolveDateRange('daysBack', { daysBack: 14 }, NOW);
    expect(r.startDate).toBeUndefined();
    expect(r.totalDays).toBe(14);
  });

  it('60 → startDate 2026-03-07, totalDays 60', () => {
    const r = resolveDateRange('daysBack', { daysBack: 60 }, NOW);
    expect(r.startDate).toBeDefined();
    expect(r.totalDays).toBe(60);
    expect(localDateStr(r.startDate!)).toBe('2026-03-07');
  });
});

describe('resolveDateRange — dateRange', () => {
  it('explicit from/to → correct totalDays', () => {
    const r = resolveDateRange('dateRange', { dateFrom: '2026-04-06', dateTo: '2026-05-06' }, NOW);
    expect(localDateStr(r.startDate!)).toBe('2026-04-06');
    expect(r.totalDays).toBe(30);
  });

  it('ISO string with offset uses calendar date, not UTC offset', () => {
    // 2026-04-01T00:00:00+10:00 = 2026-03-31T14:00:00Z; should still be treated as April 1
    const r = resolveDateRange('dateRange', { dateFrom: '2026-04-01T00:00:00+10:00', dateTo: '2026-05-01T00:00:00+10:00' }, NOW);
    expect(localDateStr(r.startDate!)).toBe('2026-04-01');
    expect(localDateStr(r.endDate)).toBe('2026-05-01');
  });

  it('omitted dateTo defaults to now', () => {
    const r = resolveDateRange('dateRange', { dateFrom: '2026-04-06' }, NOW);
    expect(r.endDate).toBe(NOW);
    expect(r.totalDays).toBe(30);
  });

  it('same from/to → totalDays 0', () => {
    const r = resolveDateRange('dateRange', { dateFrom: '2026-05-06', dateTo: '2026-05-06' }, NOW);
    expect(r.totalDays).toBe(0);
  });

  it('throws when dateFrom is empty', () => {
    expect(() => resolveDateRange('dateRange', { dateFrom: '' }, NOW)).toThrow('dateFrom is required');
  });

  it('throws when dateFrom is missing', () => {
    expect(() => resolveDateRange('dateRange', {}, NOW)).toThrow('dateFrom is required');
  });

  it('throws when dateFrom is after dateTo', () => {
    expect(() =>
      resolveDateRange('dateRange', { dateFrom: '2026-05-10', dateTo: '2026-05-01' }, NOW),
    ).toThrow('dateFrom must not be after dateTo');
  });

  it('throws when dateTo is invalid', () => {
    expect(() =>
      resolveDateRange('dateRange', { dateFrom: '2026-04-01', dateTo: 'not-a-date' }, NOW),
    ).toThrow('does not exist in the calendar');
  });

  it('throws on overflow calendar date (2026-02-31)', () => {
    expect(() =>
      resolveDateRange('dateRange', { dateFrom: '2026-02-31' }, NOW),
    ).toThrow('does not exist in the calendar');
  });
});

describe('chunkDateRange', () => {
  it('undefined startDate → single chunk, no date param', () => {
    const chunks = chunkDateRange(undefined, NOW, 7);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ date: undefined, historyDays: 7 });
  });

  it('undefined startDate, totalDays 0 → single chunk historyDays 0', () => {
    const chunks = chunkDateRange(undefined, NOW, 0);
    expect(chunks).toEqual([{ date: undefined, historyDays: 0 }]);
  });

  it('31-day date range → 1 chunk', () => {
    const start = new Date(2026, 2, 6); // 2026-03-06 local
    const end = new Date(2026, 3, 6);   // 2026-04-06 local
    const chunks = chunkDateRange(start, end, 31);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].historyDays).toBe(31);
    expect(localDateStr(start)).toBe(chunks[0].date);
  });

  it('32-day range → 2 chunks (boundary just over 31-day cap)', () => {
    const start = new Date(2026, 2, 5); // 2026-03-05 local
    const end = new Date(2026, 3, 6);   // 2026-04-06 local (32 days later)
    const chunks = chunkDateRange(start, end, 32);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].historyDays).toBe(31);
    expect(chunks[1].historyDays).toBe(1);
  });

  it('45-day range → 2 chunks', () => {
    const start = new Date('2026-03-22T00:00:00.000Z');
    const end = new Date('2026-05-06T00:00:00.000Z');
    const chunks = chunkDateRange(start, end, 45);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toEqual({ date: '2026-03-22', historyDays: 31 });
    expect(chunks[1]).toEqual({ date: '2026-04-22', historyDays: 14 });
  });

  it('90-day range → 3 chunks', () => {
    const start = new Date('2026-02-05T00:00:00.000Z');
    const end = new Date('2026-05-06T00:00:00.000Z');
    const chunks = chunkDateRange(start, end, 90);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual({ date: '2026-02-05', historyDays: 31 });
    expect(chunks[1]).toEqual({ date: '2026-03-08', historyDays: 31 });
    expect(chunks[2]).toEqual({ date: '2026-04-08', historyDays: 28 });
  });

  it('same start/end → single chunk historyDays 0', () => {
    const d = new Date('2026-05-06T00:00:00.000Z');
    const chunks = chunkDateRange(d, d, 0);
    expect(chunks).toEqual([{ date: '2026-05-06', historyDays: 0 }]);
  });
});
