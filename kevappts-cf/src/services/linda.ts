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

export interface LindaWindow {
  id: number;
  start: string;
  end: string;
  note: string;
}

export interface LindaConfig {
  enabled: boolean;
  /** All booking periods Linda has set. Ordered ascending by start date. */
  windows: LindaWindow[];
  /** First window's start — kept for backward compat with older readers. */
  windowStart: string;
  /** Last window's end — kept for backward compat with older readers. */
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

  // Load windows; one-time migration from legacy LINDA_WINDOW_START/END.
  let windowRows = await db.prepare(
    'SELECT id, start_date AS s, end_date AS e, note FROM linda_windows ORDER BY start_date'
  ).all<{ id: number; s: string; e: string; note: string }>();
  if (!windowRows.results.length) {
    const legacyStart = map['LINDA_WINDOW_START'];
    const legacyEnd = map['LINDA_WINDOW_END'];
    if (legacyStart && legacyEnd) {
      await db.prepare(
        "INSERT INTO linda_windows (start_date, end_date, note, created_at) VALUES (?, ?, 'migrated', datetime('now'))"
      ).bind(legacyStart, legacyEnd).run();
      windowRows = await db.prepare(
        'SELECT id, start_date AS s, end_date AS e, note FROM linda_windows ORDER BY start_date'
      ).all<{ id: number; s: string; e: string; note: string }>();
    }
  }

  const windows: LindaWindow[] = windowRows.results.map(r => ({
    id: r.id, start: r.s, end: r.e, note: r.note || '',
  }));

  // Fallback single default if nothing at all exists yet.
  if (!windows.length) {
    windows.push({ id: 0, start: DEFAULT_WINDOW_START, end: DEFAULT_WINDOW_END, note: '' });
  }

  return {
    enabled: map['LINDA_ENABLED'] === '1' || map['LINDA_ENABLED'] === 'true',
    windows,
    windowStart: windows[0].start,
    windowEnd: windows[windows.length - 1].end,
    slotMin,
    hours,
  };
}

export function isInLindaWindow(dateKey: string, cfg: LindaConfig): boolean {
  for (const w of cfg.windows) {
    if (dateKey >= w.start && dateKey <= w.end) return true;
  }
  return false;
}

export function buildLindaSlots(
  dateKey: string,
  cfg: LindaConfig,
  extras?: { start: string; end: string }[] | null,
  isDayOff?: boolean,
): Slot[] {
  // If Linda has marked this date as a day off, no slots at all — regardless
  // of her base weekly schedule or any extras.
  if (isDayOff) return [];
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

export async function isLindaDayOff(db: D1Database, dateKey: string): Promise<boolean> {
  const row = await db.prepare('SELECT 1 AS x FROM linda_off WHERE date_key = ?').bind(dateKey).first<{ x: number }>();
  return !!row;
}

export function buildLindaDateOptions(tz: string, cfg: LindaConfig): DateOption[] {
  const today = todayLocal(tz);
  const out: DateOption[] = [];
  const seen = new Set<string>();

  // Iterate every booking window and emit each date (on or after today) once.
  // Windows are already sorted by start date in loadLindaConfig, so the
  // resulting list is monotonic; we still dedupe to be safe against overlaps.
  for (const w of cfg.windows) {
    const start = parseDateKey(w.start);
    const end = parseDateKey(w.end);
    if (end.getTime() < start.getTime()) continue;
    let d = new Date(Math.max(today.getTime(), start.getTime()));
    while (d.getTime() <= end.getTime()) {
      const dk = toDateKey(d);
      if (!seen.has(dk)) {
        seen.add(dk);
        const dow = dayOfWeekKey(d);
        const hasHours = cfg.hours[dow] && cfg.hours[dow].length > 0;
        out.push({
          dateKey: dk,
          label: formatDateLabel(d, tz),
          disabled: !hasHours,
          reason: hasHours ? '' : 'Closed',
          spinolaOnly: false,
        });
      }
      d = addDays(d, 1);
    }
  }

  return out;
}
