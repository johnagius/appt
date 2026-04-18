/**
 * Google Calendar — WRITE-ONLY integration.
 *
 * D1 is the source of truth for slot availability.
 * Google Calendar is only used to create/delete events so the doctor
 * sees appointments in their calendar app. Never read from it.
 *
 * Auth: OAuth2 refresh token (one-time setup via OAuth Playground).
 */
import type { Env, Appointment } from '../types';

/** Exchange refresh token for a short-lived access token. */
async function getAccessToken(env: Env): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Google OAuth token error:', res.status, text);
    throw new Error('Failed to get Google access token');
  }

  const data: any = await res.json();
  return data.access_token;
}

/** Create a calendar event for a booked appointment. Returns event ID. */
export async function createCalendarEvent(env: Env, appt: Appointment): Promise<string> {
  if (!env.GOOGLE_REFRESH_TOKEN || !env.GOOGLE_CLIENT_ID) return '';

  const calId = appt.clinic === 'spinola'
    ? env.GOOGLE_SPINOLA_CALENDAR_ID
    : appt.clinic === 'linda'
      ? env.LINDA_CALENDAR_ID
      : env.GOOGLE_CALENDAR_ID;
  if (!calId) return '';

  try {
    const token = await getAccessToken(env);
    const tz = env.TIMEZONE;
    const title = appt.service_name + ' - ' + appt.full_name;
    const description = [
      'Patient: ' + appt.full_name,
      'Email: ' + appt.email,
      'Phone: ' + appt.phone,
      appt.comments ? 'Comments: ' + appt.comments : '',
      'ID: ' + appt.id,
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
          start: { dateTime: `${appt.date_key}T${appt.start_time}:00`, timeZone: tz },
          end: { dateTime: `${appt.date_key}T${appt.end_time}:00`, timeZone: tz },
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

/** Delete a calendar event (on cancellation). */
export async function deleteCalendarEvent(env: Env, eventId: string, clinic: 'potters' | 'spinola' | 'linda' = 'potters'): Promise<void> {
  if (!eventId || !env.GOOGLE_REFRESH_TOKEN || !env.GOOGLE_CLIENT_ID) return;

  const calId = clinic === 'spinola'
    ? env.GOOGLE_SPINOLA_CALENDAR_ID
    : clinic === 'linda'
      ? env.LINDA_CALENDAR_ID
      : env.GOOGLE_CALENDAR_ID;
  if (!calId) return;

  try {
    const token = await getAccessToken(env);
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
