/**
 * Google Calendar integration via REST API + Service Account.
 * Uses JWT for auth (no OAuth flow needed).
 */
import type { Env, Appointment } from '../types';
import { parseDateKey, parseTimeToMinutes, minutesToTime } from './utils';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

async function getAccessToken(env: Env): Promise<string> {
  const sa: ServiceAccountKey = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: any) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signingInput = enc(header) + '.' + enc(payload);

  // Import RSA private key
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const jwt = signingInput + '.' + sigB64;

  const tokenRes = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData: any = await tokenRes.json();
  return tokenData.access_token;
}

function buildEventDateTime(dateKey: string, time: string, tz: string): string {
  return dateKey + 'T' + time + ':00';
}

export async function createCalendarEvent(env: Env, appt: Appointment, calendarId?: string): Promise<string> {
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON || !env.GOOGLE_CALENDAR_ID) return '';

  try {
    const token = await getAccessToken(env);
    const calId = calendarId || (appt.clinic === 'spinola' ? env.GOOGLE_SPINOLA_CALENDAR_ID : env.GOOGLE_CALENDAR_ID);
    if (!calId) return '';

    const tz = env.TIMEZONE;
    const title = appt.service_name + ' - ' + appt.full_name;
    const description = [
      'Patient: ' + appt.full_name,
      'Email: ' + appt.email,
      'Phone: ' + appt.phone,
      appt.comments ? 'Comments: ' + appt.comments : '',
      'Status: ' + appt.status,
      'Token: ' + appt.token,
    ].filter(Boolean).join('\n');

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title,
          description,
          location: appt.location,
          start: { dateTime: buildEventDateTime(appt.date_key, appt.start_time, tz), timeZone: tz },
          end: { dateTime: buildEventDateTime(appt.date_key, appt.end_time, tz), timeZone: tz },
        }),
      }
    );

    if (res.ok) {
      const data: any = await res.json();
      return data.id || '';
    }
    console.error('Calendar create error:', res.status, await res.text());
    return '';
  } catch (e) {
    console.error('Calendar create failed:', e);
    return '';
  }
}

export async function deleteCalendarEvent(env: Env, eventId: string, clinic: 'potters' | 'spinola' = 'potters'): Promise<void> {
  if (!eventId || !env.GOOGLE_SERVICE_ACCOUNT_JSON) return;

  try {
    const token = await getAccessToken(env);
    const calId = clinic === 'spinola' ? env.GOOGLE_SPINOLA_CALENDAR_ID : env.GOOGLE_CALENDAR_ID;
    if (!calId) return;

    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
  } catch (e) {
    console.error('Calendar delete failed:', e);
  }
}

export async function listCalendarTakenSlots(env: Env, dateKey: string, clinic: 'potters' | 'spinola' = 'potters', durationMin: number = 10): Promise<Set<string>> {
  const taken = new Set<string>();
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON) return taken;

  try {
    const token = await getAccessToken(env);
    const calId = clinic === 'spinola' ? env.GOOGLE_SPINOLA_CALENDAR_ID : env.GOOGLE_CALENDAR_ID;
    if (!calId) return taken;

    const tz = env.TIMEZONE;
    const timeMin = dateKey + 'T00:00:00';
    const timeMax = dateKey + 'T23:59:59';

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?` +
      `timeMin=${encodeURIComponent(timeMin + '+01:00')}&timeMax=${encodeURIComponent(timeMax + '+01:00')}&singleEvents=true&maxResults=100`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!res.ok) return taken;

    const data: any = await res.json();
    const maxEventDur = durationMin * 2;

    for (const ev of (data.items || [])) {
      if (!ev.start?.dateTime || !ev.end?.dateTime) continue;
      const evStart = ev.start.dateTime.substring(11, 16);
      const evEnd = ev.end.dateTime.substring(11, 16);
      const evStartMin = parseTimeToMinutes(evStart);
      let evEndMin = parseTimeToMinutes(evEnd);
      if (evEndMin <= evStartMin) evEndMin = 1440;
      if (evEndMin - evStartMin > maxEventDur) continue;
      taken.add(minutesToTime(evStartMin));
    }
  } catch (e) {
    console.error('Calendar list failed:', e);
  }

  return taken;
}
