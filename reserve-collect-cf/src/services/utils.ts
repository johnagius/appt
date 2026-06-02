/** Date/time + sanitization helpers (subset copied from kevappts-cf). */

export function pad2(n: number): string {
  const s = String(n);
  return s.length === 1 ? '0' + s : s;
}

export function toDateKey(d: Date): string {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/** Current timestamp in the given timezone as "YYYY-MM-DD HH:MM:SS". */
export function nowIso(tz: string): string {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA', { timeZone: tz });
  const time = now.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false });
  return date + ' ' + time;
}

/** Timestamp `ms` milliseconds from now, formatted in tz as "YYYY-MM-DD HH:MM:SS".
 *  String-comparable against nowIso() for expiry checks. */
export function isoOffset(tz: string, ms: number): string {
  const d = new Date(Date.now() + ms);
  const date = d.toLocaleDateString('en-CA', { timeZone: tz });
  const time = d.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false });
  return date + ' ' + time;
}
export function isoPlusMinutes(tz: string, mins: number): string {
  return isoOffset(tz, mins * 60000);
}
export function isoPlusDays(tz: string, days: number): string {
  return isoOffset(tz, days * 86400000);
}

/** A short, friendly relative/absolute date label for the UI. */
export function formatDateTime(iso: string): string {
  if (!iso) return '';
  // Stored as "YYYY-MM-DD HH:MM:SS" in local (Malta) time — show as-is, trimmed.
  return iso.replace('T', ' ').slice(0, 16);
}

export function sanitizePhone(phone: string): string {
  return (phone || '').trim().replace(/\s+/g, ' ');
}

export function sanitizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function sanitizeName(name: string): string {
  return (name || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** True if the ISO timestamp (in tz local time) is in the past relative to now(tz). */
export function isPast(iso: string, tz: string): boolean {
  if (!iso) return true;
  return iso <= nowIso(tz);
}
