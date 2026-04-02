import type { TimeWindow, Slot, WorkingHours } from '../types';

const DEFAULT_HOURS: WorkingHours = {
  MON: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  TUE: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  WED: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  THU: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  FRI: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '19:00' }],
  SAT: [{ start: '10:00', end: '12:00' }],
  SUN: [],
};

const DEFAULT_SPINOLA_HOURS: WorkingHours = {
  MON: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  TUE: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  WED: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  THU: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  FRI: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
  SAT: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '19:00' }],
  SUN: [{ start: '10:00', end: '12:00' }],
};

export { DEFAULT_HOURS, DEFAULT_SPINOLA_HOURS };

export function pad2(n: number): string {
  const s = String(n);
  return s.length === 1 ? '0' + s : s;
}

export function parseTimeToMinutes(hhmm: string): number {
  const p = hhmm.split(':');
  if (p.length !== 2) throw new Error('Invalid time: ' + hhmm);
  return Number(p[0]) * 60 + Number(p[1]);
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return pad2(h) + ':' + pad2(m);
}

export function parseDateKey(dateKey: string): Date {
  const parts = dateKey.split('-');
  if (parts.length !== 3) throw new Error('Invalid dateKey: ' + dateKey);
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0, 0);
}

export function toDateKey(d: Date): string {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/** Get today's date in the given timezone */
export function todayLocal(tz: string): Date {
  const now = new Date();
  const s = now.toLocaleDateString('en-CA', { timeZone: tz }); // en-CA gives YYYY-MM-DD
  return parseDateKey(s);
}

export function todayKeyLocal(tz: string): string {
  return toDateKey(todayLocal(tz));
}

export function nowMinutesLocal(tz: string): number {
  const now = new Date();
  const s = now.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' });
  return parseTimeToMinutes(s);
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

export function dayOfWeekKey(d: Date): string {
  const dow = d.getDay();
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dow];
}

export function isSunday(d: Date): boolean {
  return d.getDay() === 0;
}

export function formatDateLabel(d: Date, tz: string): string {
  return d.toLocaleDateString('en-GB', {
    timeZone: tz,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Maltese public holidays (fixed dates) */
const FIXED_HOLIDAYS = [
  '01-01', '02-10', '03-19', '03-31', '05-01',
  '06-07', '06-29', '08-15', '09-08', '09-21',
  '12-08', '12-13', '12-25',
];

export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function goodFriday(year: number): Date {
  const easter = easterSunday(year);
  return new Date(easter.getTime() - 2 * 86400000);
}

export function isHolidayOrClosed(d: Date): { closed: boolean; reason: string } {
  if (isSunday(d)) return { closed: true, reason: 'Sunday (Closed)' };

  const mmdd = pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  if (FIXED_HOLIDAYS.includes(mmdd)) return { closed: true, reason: 'Public holiday' };

  const gf = goodFriday(d.getFullYear());
  if (toDateKey(gf) === toDateKey(d)) return { closed: true, reason: 'Good Friday' };

  return { closed: false, reason: '' };
}

export function inAdvanceWindow(d: Date, today: Date, advanceDays: number): boolean {
  const max = addDays(today, advanceDays);
  return d.getTime() >= today.getTime() && d.getTime() <= max.getTime();
}

export function buildSlotsForDate(
  d: Date,
  durationMin: number,
  extraWindows: TimeWindow[] | null,
  hoursOverride?: WorkingHours
): Slot[] {
  const dowKey = dayOfWeekKey(d);
  const hoursSource = hoursOverride || DEFAULT_HOURS;
  const windows: TimeWindow[] = [...(hoursSource[dowKey] || [])];

  if (extraWindows) {
    for (const w of extraWindows) windows.push(w);
  }

  windows.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));

  const slots: Slot[] = [];
  const usedMinutes: Record<number, boolean> = {};

  for (const w of windows) {
    const startMin = parseTimeToMinutes(w.start);
    const endMin = parseTimeToMinutes(w.end);

    for (let m = startMin; m + durationMin <= endMin; m += durationMin) {
      if (!usedMinutes[m]) {
        usedMinutes[m] = true;
        slots.push({ start: minutesToTime(m), end: minutesToTime(m + durationMin) });
      }
    }
  }

  slots.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
  return slots;
}

export function sanitizePhone(phone: string): string {
  return (phone || '').trim().replace(/\s+/g, ' ');
}

export function sanitizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function sanitizeName(name: string): string {
  return (name || '').trim();
}

export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function nowIso(tz: string): string {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA', { timeZone: tz });
  const time = now.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false });
  return date + ' ' + time;
}

export function dedupeJoinReasons(reasons: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of reasons) {
    const trimmed = r.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      out.push(trimmed);
    }
  }
  return out.join(' / ');
}
