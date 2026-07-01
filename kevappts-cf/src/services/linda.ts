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
  parseTimeToMinutes, todayLocal, toDateKey,
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

/** Per-stint working hours: which weekdays are open and the time ranges that
 *  apply to each of those days. When present on a window, these take precedence
 *  over the global weekly LINDA_HOURS for dates that window covers. */
export interface WindowHours {
  days: string[];                               // e.g. ['MON','TUE',...]
  ranges: { start: string; end: string }[];     // e.g. [{start:'09:00',end:'13:00'}]
}

export interface LindaWindow {
  id: number;
  start: string;
  end: string;
  note: string;
  /** null/empty ⇒ legacy stint that uses the global weekly hours. */
  hours: WindowHours | null;
}

const DOW_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseWindowHours(raw: string | null | undefined): WindowHours | null {
  if (!raw) return null;
  try {
    const h = JSON.parse(raw);
    if (h && Array.isArray(h.days) && Array.isArray(h.ranges) && h.ranges.length) {
      return {
        days: h.days.filter((d: string) => DOW_KEYS.includes(d)),
        ranges: h.ranges
          .filter((r: any) => /^\d{2}:\d{2}$/.test(r.start) && /^\d{2}:\d{2}$/.test(r.end) && r.start < r.end)
          .map((r: any) => ({ start: r.start, end: r.end })),
      };
    }
  } catch {}
  return null;
}

/** One-time, idempotent migration so existing prod DBs gain the hours column
 *  without a manual ALTER. Safe to call on every load (fails silently if the
 *  column already exists). */
async function ensureWindowHoursColumn(db: D1Database): Promise<void> {
  try { await db.prepare("ALTER TABLE linda_windows ADD COLUMN hours TEXT DEFAULT ''").run(); } catch {}
}
export { ensureWindowHoursColumn };

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

  // Load windows (with per-stint hours), tolerating older DBs that lack the
  // hours column by adding it on first use. One-time migration from legacy
  // LINDA_WINDOW_START/END if the table is empty.
  type WRow = { id: number; s: string; e: string; note: string; h: string };
  const WIN_SQL = 'SELECT id, start_date AS s, end_date AS e, note, hours AS h FROM linda_windows ORDER BY start_date';
  const loadWinRows = async () => {
    try { return await db.prepare(WIN_SQL).all<WRow>(); }
    catch { await ensureWindowHoursColumn(db); return await db.prepare(WIN_SQL).all<WRow>(); }
  };
  let windowRows = await loadWinRows();
  if (!windowRows.results.length) {
    const legacyStart = map['LINDA_WINDOW_START'];
    const legacyEnd = map['LINDA_WINDOW_END'];
    if (legacyStart && legacyEnd) {
      await db.prepare(
        "INSERT INTO linda_windows (start_date, end_date, note, created_at) VALUES (?, ?, 'migrated', datetime('now'))"
      ).bind(legacyStart, legacyEnd).run();
      windowRows = await loadWinRows();
    }
  }

  const windows: LindaWindow[] = windowRows.results.map(r => ({
    id: r.id, start: r.s, end: r.e, note: r.note || '', hours: parseWindowHours(r.h),
  }));

  // Fallback single default if nothing at all exists yet.
  if (!windows.length) {
    windows.push({ id: 0, start: DEFAULT_WINDOW_START, end: DEFAULT_WINDOW_END, note: '', hours: null });
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

/** The effective base working ranges for a date: the union of the hours from
 *  every covering stint whose weekday-set includes this date's weekday. Hours
 *  live on stints (set with the bar) — nothing else. A stint with no hours (or
 *  a weekday it doesn't cover) contributes nothing. The global weekly LINDA_HOURS
 *  is intentionally NOT consulted, so a legacy value can never leak in.
 *  Ad-hoc extras are still layered on top by buildLindaSlots. */
export function baseRangesForDate(dateKey: string, cfg: LindaConfig): { start: string; end: string }[] {
  const dow = dayOfWeekKey(parseDateKey(dateKey));
  const out: { start: string; end: string }[] = [];
  for (const w of cfg.windows) {
    if (dateKey < w.start || dateKey > w.end) continue;
    if (w.hours && w.hours.ranges.length && w.hours.days.includes(dow)) out.push(...w.hours.ranges);
  }
  return out;
}

export function buildLindaSlots(
  dateKey: string,
  cfg: LindaConfig,
  extras?: { start: string; end: string }[] | null,
  isDayOff?: boolean,
  blocks?: { start: string; end: string }[] | null,
): Slot[] {
  // If Linda has marked this date as a day off, no slots at all — regardless
  // of her base weekly schedule or any extras.
  if (isDayOff) return [];
  const d = parseDateKey(dateKey);
  const dow = dayOfWeekKey(d);
  const base = baseRangesForDate(dateKey, cfg);
  const hasBase = base.length > 0;
  const hasExtra = extras && extras.length > 0;
  if (!hasBase && !hasExtra) return [];
  // buildSlotsForDate takes an hoursOverride (base hours per weekday) plus
  // extraWindows it merges in. We hand it a synthetic map with just this date's
  // resolved base ranges so stint-specific and global hours flow through the
  // same path.
  const hoursOverride = ({ MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [], [dow]: base } as any);
  const slots = buildSlotsForDate(d, cfg.slotMin, extras || null, hoursOverride);
  if (!blocks || !blocks.length) return slots;
  // Drop any slot whose [start,end) overlaps any block range.
  const blockRanges = blocks.map(b => ({
    s: parseTimeToMinutes(b.start),
    e: parseTimeToMinutes(b.end),
  }));
  return slots.filter(s => {
    const ss = parseTimeToMinutes(s.start);
    const se = parseTimeToMinutes(s.end);
    for (const r of blockRanges) {
      if (ss < r.e && se > r.s) return false;
    }
    return true;
  });
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

export async function getLindaBlocksForDate(db: D1Database, dateKey: string): Promise<{ id: number; start: string; end: string; reason: string }[]> {
  const rows = await db.prepare(
    'SELECT id, start_time AS s, end_time AS e, reason FROM linda_block WHERE date_key = ? ORDER BY start_time'
  ).bind(dateKey).all<{ id: number; s: string; e: string; reason: string }>();
  return rows.results.map(r => ({ id: r.id, start: r.s, end: r.e, reason: r.reason || '' }));
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
        const hasHours = baseRangesForDate(dk, cfg).length > 0;
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
