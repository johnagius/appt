/**
 * Linda (Physiotherapy) — isolated constants and helpers.
 *
 * Linda's bookings live on the shared appointments table with clinic='linda'.
 * The two-week availability window and 30-min slots are defined here so that
 * no Kevin/Spinola code path accidentally inherits Linda's schedule.
 */
import type { Slot, WorkingHours, DateOption } from '../types';
import {
  addDays, buildSlotsForDate, dayOfWeekKey, formatDateLabel, parseDateKey,
  todayLocal, toDateKey,
} from './utils';

export const LINDA_WINDOW_START = '2026-04-24';
export const LINDA_WINDOW_END = '2026-05-07';
export const LINDA_SLOT_MIN = 30;

export const LINDA_HOURS: WorkingHours = {
  MON: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  TUE: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  WED: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  THU: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  FRI: [{ start: '09:30', end: '13:00' }, { start: '16:00', end: '18:30' }],
  SAT: [],
  SUN: [],
};

export function isInLindaWindow(dateKey: string): boolean {
  return dateKey >= LINDA_WINDOW_START && dateKey <= LINDA_WINDOW_END;
}

export function buildLindaSlots(dateKey: string): Slot[] {
  const d = parseDateKey(dateKey);
  const dow = dayOfWeekKey(d);
  if (!LINDA_HOURS[dow] || LINDA_HOURS[dow].length === 0) return [];
  return buildSlotsForDate(d, LINDA_SLOT_MIN, null, LINDA_HOURS);
}

export function buildLindaDateOptions(tz: string): DateOption[] {
  const today = todayLocal(tz);
  const start = parseDateKey(LINDA_WINDOW_START);
  const end = parseDateKey(LINDA_WINDOW_END);
  const out: DateOption[] = [];

  let d = new Date(Math.max(today.getTime(), start.getTime()));
  while (d.getTime() <= end.getTime()) {
    const dk = toDateKey(d);
    const dow = dayOfWeekKey(d);
    const hasHours = LINDA_HOURS[dow] && LINDA_HOURS[dow].length > 0;

    out.push({
      dateKey: dk,
      label: formatDateLabel(d, tz),
      disabled: !hasHours,
      reason: hasHours ? '' : 'Closed (weekend)',
      spinolaOnly: false,
    });
    d = addDays(d, 1);
  }

  return out;
}
