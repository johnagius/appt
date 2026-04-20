/**
 * Linda (Physiotherapy) — admin-editable config loaded from the `config` table.
 *
 * All Linda-specific logic (window, hours, slot duration, enabled flag)
 * comes from D1 so the admin panel can edit it. Falls back to sensible
 * defaults if a key is missing.
 */
import type { Slot, WorkingHours, DateOption } from '../types';
import {
  addDays, buildSlotsForDate, dayOfWeekKey, formatDateLabel, parseDateKey,
  todayLocal, toDateKey,
} from './utils';

// Defaults only apply if a config key is missing (shouldn't happen after schema seed).
const DEFAULT_WINDOW_START = '2026-04-24';
const DEFAULT_WINDOW_END = '2026-05-07';
const DEFAULT_SLOT_MIN = 30;
const DEFAULT_HOURS: WorkingHours = {
  MON: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  TUE: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  WED: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  THU: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  FRI: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  SAT: [],
  SUN: [],
};

export interface LindaConfig {
  enabled: boolean;
  windowStart: string;  // YYYY-MM-DD
  windowEnd: string;
  slotMin: number;
  hours: WorkingHours;
}

export async function loadLindaConfig(db: D1Database): Promise<LindaConfig> {
  const rows = await db.prepare(
    "SELECT key, value FROM config WHERE key LIKE 'LINDA_%'"
  ).all<{ key: string; value: string }>();

  const map: Record<string, string> = {};
  for (const r of rows.results) map[r.key] = r.value;

  let hours: WorkingHours = DEFAULT_HOURS;
  try { if (map['LINDA_HOURS']) hours = JSON.parse(map['LINDA_HOURS']); } catch {}

  const slotMin = parseInt(map['LINDA_SLOT_MIN'] || String(DEFAULT_SLOT_MIN), 10) || DEFAULT_SLOT_MIN;

  return {
    enabled: map['LINDA_ENABLED'] === '1' || map['LINDA_ENABLED'] === 'true',
    windowStart: map['LINDA_WINDOW_START'] || DEFAULT_WINDOW_START,
    windowEnd: map['LINDA_WINDOW_END'] || DEFAULT_WINDOW_END,
    slotMin,
    hours,
  };
}

export function isInLindaWindow(dateKey: string, cfg: LindaConfig): boolean {
  return dateKey >= cfg.windowStart && dateKey <= cfg.windowEnd;
}

export function buildLindaSlots(dateKey: string, cfg: LindaConfig, extras?: { start: string; end: string }[] | null): Slot[] {
  const d = parseDateKey(dateKey);
  const dow = dayOfWeekKey(d);
  const base = cfg.hours[dow] || [];
  const hasBase = base.length > 0;
  const hasExtra = extras && extras.length > 0;
  if (!hasBase && !hasExtra) return [];
  // buildSlotsForDate takes an hoursOverride (used for base) plus extraWindows
  // that it merges in. If Linda has no base hours that day but has extras,
  // pass an empty hours map but the extras will add slots on their own.
  const hoursOverride = hasBase
    ? cfg.hours
    : ({ MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [], [dow]: [] } as any);
  return buildSlotsForDate(d, cfg.slotMin, extras || null, hoursOverride);
}

export async function getLindaExtrasForDate(db: D1Database, dateKey: string): Promise<{ id: number; start: string; end: string }[]> {
  const rows = await db.prepare(
    'SELECT id, start_time AS s, end_time AS e FROM linda_extra WHERE date_key = ? ORDER BY start_time'
  ).bind(dateKey).all<{ id: number; s: string; e: string }>();
  return rows.results.map(r => ({ id: r.id, start: r.s, end: r.e }));
}

export function buildLindaDateOptions(tz: string, cfg: LindaConfig): DateOption[] {
  const today = todayLocal(tz);
  const start = parseDateKey(cfg.windowStart);
  const end = parseDateKey(cfg.windowEnd);
  const out: DateOption[] = [];

  if (end.getTime() < start.getTime()) return out;

  let d = new Date(Math.max(today.getTime(), start.getTime()));
  while (d.getTime() <= end.getTime()) {
    const dk = toDateKey(d);
    const dow = dayOfWeekKey(d);
    const hasHours = cfg.hours[dow] && cfg.hours[dow].length > 0;

    out.push({
      dateKey: dk,
      label: formatDateLabel(d, tz),
      disabled: !hasHours,
      reason: hasHours ? '' : 'Closed',
      spinolaOnly: false,
    });
    d = addDays(d, 1);
  }

  return out;
}
