/**
 * Blood Tests — admin-editable config loaded from the `config` table.
 *
 * Blood tests are run by pharmacy staff at Potter's, independent of Dr Kevin.
 * They live in the main `appointments` table with clinic='potters' and
 * service_id='blood-test' so cancel/reschedule/review flows are reused, but
 * everywhere doctor-availability is checked we filter blood-test rows out so
 * a doctor-off event never touches them. See admin.ts where the filter is
 * extended alongside the existing linda/spinola exclusion.
 */
import type { Slot, WorkingHours, DateOption } from '../types';
import {
  addDays, buildSlotsForDate, dayOfWeekKey, formatDateLabel, parseDateKey,
  todayLocal, toDateKey,
} from './utils';

const DEFAULT_SLOT_MIN = 10;
// Public booking horizon. Blood tests run year-round, so we expose a rolling
// 14-day window from "today" rather than admin-set start/end dates.
const PUBLIC_HORIZON_DAYS = 14;
const DEFAULT_HOURS: WorkingHours = {
  MON: [{ start: '08:00', end: '09:00' }],
  TUE: [{ start: '08:00', end: '09:00' }],
  WED: [{ start: '08:00', end: '09:00' }],
  THU: [{ start: '08:00', end: '09:00' }],
  FRI: [{ start: '08:00', end: '09:00' }],
  SAT: [{ start: '08:00', end: '09:00' }],
  SUN: [],
};

export interface BloodTestConfig {
  enabled: boolean;
  slotMin: number;
  priceCents: number;
  /** Newline- or comma-separated list of test types the patient can pick. Empty = single generic "Blood Test". */
  types: string[];
  hours: WorkingHours;
}

export async function loadBloodTestConfig(db: D1Database): Promise<BloodTestConfig> {
  const rows = await db.prepare(
    "SELECT key, value FROM config WHERE key LIKE 'BLOOD_TEST_%'"
  ).all<{ key: string; value: string }>();

  const map: Record<string, string> = {};
  for (const r of rows.results) map[r.key] = r.value;

  let hours: WorkingHours = DEFAULT_HOURS;
  try { if (map['BLOOD_TEST_HOURS']) hours = JSON.parse(map['BLOOD_TEST_HOURS']); } catch {}

  let types: string[] = [];
  try {
    if (map['BLOOD_TEST_TYPES']) {
      const raw = JSON.parse(map['BLOOD_TEST_TYPES']);
      if (Array.isArray(raw)) types = raw.map((s: any) => String(s).trim()).filter(Boolean);
    }
  } catch {}

  return {
    enabled: map['BLOOD_TEST_ENABLED'] === '1' || map['BLOOD_TEST_ENABLED'] === 'true',
    slotMin: parseInt(map['BLOOD_TEST_SLOT_MIN'] || String(DEFAULT_SLOT_MIN), 10) || DEFAULT_SLOT_MIN,
    priceCents: parseInt(map['BLOOD_TEST_PRICE_CENTS'] || '0', 10) || 0,
    types,
    hours,
  };
}

export function buildBloodTestSlots(
  dateKey: string,
  cfg: BloodTestConfig,
  isDayOff?: boolean,
): Slot[] {
  if (isDayOff) return [];
  const d = parseDateKey(dateKey);
  const dow = dayOfWeekKey(d);
  const windows = cfg.hours[dow] || [];
  if (!windows.length) return [];
  return buildSlotsForDate(d, cfg.slotMin, null, cfg.hours);
}

export async function isBloodTestDayOff(db: D1Database, dateKey: string): Promise<boolean> {
  const row = await db.prepare('SELECT 1 AS x FROM blood_test_off WHERE date_key = ?').bind(dateKey).first<{ x: number }>();
  return !!row;
}

export function buildBloodTestDateOptions(tz: string, cfg: BloodTestConfig): DateOption[] {
  const today = todayLocal(tz);
  const out: DateOption[] = [];
  for (let i = 0; i < PUBLIC_HORIZON_DAYS; i++) {
    const d = addDays(today, i);
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
  }
  return out;
}
