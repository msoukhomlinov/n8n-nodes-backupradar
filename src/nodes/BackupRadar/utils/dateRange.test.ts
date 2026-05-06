import { describe, it, expect } from 'vitest';
import { PRESET_MAP, resolveDateRange } from './dateRange.js';

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
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-03-22');
  });

  it('last-90-days → startDate 2026-02-05, totalDays 90', () => {
    const r = resolveDateRange('preset', { preset: 'last-90-days' }, NOW);
    expect(r.startDate).toBeDefined();
    expect(r.totalDays).toBe(90);
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-02-05');
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
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-03-07');
  });
});

describe('resolveDateRange — dateRange', () => {
  it('explicit from/to → correct totalDays', () => {
    const r = resolveDateRange('dateRange', { dateFrom: '2026-04-01', dateTo: '2026-05-01' }, NOW);
    expect(r.startDate!.toISOString().split('T')[0]).toBe('2026-04-01');
    expect(r.totalDays).toBe(30);
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
});
