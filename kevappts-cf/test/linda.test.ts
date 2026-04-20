import { describe, it, expect } from 'vitest';
import {
  buildLindaSlots,
  buildLindaDateOptions,
  isInLindaWindow,
  type LindaConfig,
} from '../src/services/linda';

const standardConfig: LindaConfig = {
  enabled: true,
  windowStart: '2026-04-24',
  windowEnd: '2026-05-07',
  slotMin: 30,
  hours: {
    MON: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '19:00' }],
    TUE: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '19:00' }],
    WED: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '19:00' }],
    THU: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '19:00' }],
    FRI: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '19:00' }],
    SAT: [],
    SUN: [],
  },
};

describe('isInLindaWindow', () => {
  it('accepts the first and last day of the window', () => {
    expect(isInLindaWindow('2026-04-24', standardConfig)).toBe(true);
    expect(isInLindaWindow('2026-05-07', standardConfig)).toBe(true);
  });

  it('rejects dates before and after the window', () => {
    expect(isInLindaWindow('2026-04-23', standardConfig)).toBe(false);
    expect(isInLindaWindow('2026-05-08', standardConfig)).toBe(false);
  });

  it('uses lexicographic YYYY-MM-DD compare (safe for ISO dates)', () => {
    const cfg = { ...standardConfig, windowStart: '2026-01-01', windowEnd: '2026-12-31' };
    expect(isInLindaWindow('2026-02-15', cfg)).toBe(true);
    expect(isInLindaWindow('2027-01-01', cfg)).toBe(false);
  });
});

describe('buildLindaSlots', () => {
  it('produces 30-min slots for a standard weekday with morning + evening', () => {
    // 2026-04-24 is Friday. Window: 09:30-13:00 (7 slots) + 16:00-19:00 (6 slots) = 13 slots.
    const slots = buildLindaSlots('2026-04-24', standardConfig);
    expect(slots.length).toBe(13);
    expect(slots[0]).toMatchObject({ start: '09:30', end: '10:00' });
    expect(slots[6]).toMatchObject({ start: '12:30', end: '13:00' });
    expect(slots[7]).toMatchObject({ start: '16:00', end: '16:30' });
    expect(slots[12]).toMatchObject({ start: '18:30', end: '19:00' });
  });

  it('returns no slots on a closed weekend when no extras', () => {
    // 2026-04-25 is Saturday — SAT window is empty in standardConfig.
    expect(buildLindaSlots('2026-04-25', standardConfig)).toEqual([]);
  });

  it('uses extras to open a closed day', () => {
    // Saturday with ad-hoc 10:00-12:00 extra — 4 slots (10:00,10:30,11:00,11:30).
    const slots = buildLindaSlots('2026-04-25', standardConfig, [{ start: '10:00', end: '12:00' }]);
    expect(slots.map(s => s.start)).toEqual(['10:00', '10:30', '11:00', '11:30']);
  });

  it('merges extras with base hours without duplicating', () => {
    // Extra that overlaps 11:00-12:30 (which is inside the morning block) must not
    // produce duplicate 11:00 / 11:30 / 12:00 slots. buildSlotsForDate dedupes by
    // start-minute bucket.
    const slots = buildLindaSlots('2026-04-24', standardConfig, [{ start: '11:00', end: '12:30' }]);
    const startTimes = slots.map(s => s.start);
    const unique = Array.from(new Set(startTimes));
    expect(startTimes.length).toBe(unique.length);
  });

  it('respects a 60-min slotMin', () => {
    const hourly: LindaConfig = { ...standardConfig, slotMin: 60 };
    const slots = buildLindaSlots('2026-04-24', hourly);
    // Morning 09:30-13:00 at 60-min step = 09:30,10:30,11:30,12:30 — but 12:30+60 = 13:30 > 13:00,
    // so only 09:30,10:30,11:30. Evening 16:00-19:00 = 16:00,17:00,18:00. Total = 6.
    expect(slots.map(s => s.start)).toEqual(['09:30', '10:30', '11:30', '16:00', '17:00', '18:00']);
  });
});

describe('buildLindaDateOptions', () => {
  it('returns Mon-Fri inside the window as enabled, weekends as closed', () => {
    const future: LindaConfig = { ...standardConfig, windowStart: '2026-04-24', windowEnd: '2026-04-27' };
    const opts = buildLindaDateOptions('Europe/Malta', future);
    expect(opts.length).toBe(4); // Fri, Sat, Sun, Mon
    expect(opts[0]).toMatchObject({ dateKey: '2026-04-24', disabled: false }); // Fri
    expect(opts[1]).toMatchObject({ dateKey: '2026-04-25', disabled: true, reason: 'Closed' }); // Sat
    expect(opts[2]).toMatchObject({ dateKey: '2026-04-26', disabled: true }); // Sun
    expect(opts[3]).toMatchObject({ dateKey: '2026-04-27', disabled: false }); // Mon
  });

  it('returns an empty list when end is before start', () => {
    const bad: LindaConfig = { ...standardConfig, windowStart: '2026-05-07', windowEnd: '2026-04-24' };
    expect(buildLindaDateOptions('Europe/Malta', bad)).toEqual([]);
  });
});
