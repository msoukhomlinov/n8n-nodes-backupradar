import { describe, it, expect } from 'vitest';
import { PRESET_MAP } from './dateRange.js';

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
