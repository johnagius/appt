/**
 * Cancel & Doctor Action APIs
 */
import type { Env } from '../types';
import { nowIso } from '../services/utils';
import { verifyCancelSig, verifyDocActionSig } from '../services/crypto';
import {
  getAppointmentByToken, updateAppointmentStatus, bumpVersion,
  getActiveAppointmentsByDate, insertAppointment, getConfig,
} from '../db/queries';
import {
  sendClientCancelledEmail, sendDoctorCancellationEmail,
  sendRedirectToSpinolaEmail,
} from '../services/email';
import { generateId } from '../services/crypto';
import { deleteCalendarEvent, createCalendarEvent } from '../services/calendar';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function isActive(status: string): boolean {
  return status === 'BOOKED' || status === 'RELOCATED_SPINOLA';
}

// ─── Cancel Info ───────────────────────────────────────────

export async function apiGetCancelInfo(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const token = (url.searchParams.get('token') || '').trim();
  const sig = (url.searchParams.get('sig') || '').trim();

  if (!await verifyCancelSig(token, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired cancel link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  return json({
    ok: true,
    appointment: {
      appointmentId: appt.id,
      dateKey: appt.date_key,
      startTime: appt.start_time,
      endTime: appt.end_time,
      serviceName: appt.service_name,
      fullName: appt.full_name,
      email: appt.email,
      phone: appt.phone,
      status: appt.status,
      location: appt.location,
    },
  });
}

// ─── Cancel Appointment ────────────────────────────────────

export async function apiCancelAppointment(req: Request, env: Env): Promise<Response> {
  const body: { token?: string; sig?: string } = await req.json();
  const token = (body.token || '').trim();
  const sig = (body.sig || '').trim();

  if (!await verifyCancelSig(token, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired cancel link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  if (!isActive(appt.status)) {
    return json({ ok: true, alreadyCancelled: true, message: 'This appointment is already cancelled.', appointmentId: appt.id });
  }

  const now = nowIso(env.TIMEZONE);

  await updateAppointmentStatus(env.DB, appt.id, {
    status: 'CANCELLED_CLIENT',
    cancelled_at: now,
    cancel_reason: 'Cancelled by client via email link',
    calendar_event_id: '',
  }, now);
  await bumpVersion(env.DB);

  // Broadcast SYNCHRONOUSLY before returning response
  try {
    const doId = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(doId);
    await stub.fetch('http://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key }),
    });
  } catch {}

  // Fire-and-forget emails + calendar
  const ctx = (globalThis as any).__ctx;
  if (ctx?.waitUntil) {
    ctx.waitUntil((async () => {
      // Delete Google Calendar event
      if (appt.calendar_event_id) {
        try { await deleteCalendarEvent(env, appt.calendar_event_id, appt.clinic as any); } catch {}
      }
      try { await sendClientCancelledEmail(env, appt, 'Your appointment has been cancelled.'); } catch {}
      try { await sendDoctorCancellationEmail(env, appt, 'Client cancelled via email link.'); } catch {}
    })());
  }

  return json({ ok: true, alreadyCancelled: false, message: 'Appointment cancelled successfully.', appointmentId: appt.id });
}

// ─── Doctor Action ─────────────────────────────────────────

export async function apiDoctorAction(req: Request, env: Env): Promise<Response> {
  const body: { token?: string; act?: string; sig?: string } = await req.json();
  const token = (body.token || '').trim();
  const act = (body.act || '').trim();
  const sig = (body.sig || '').trim();

  if (!await verifyDocActionSig(token, act, sig, env.SIGNING_SECRET)) {
    return json({ ok: false, reason: 'Invalid or expired link.' });
  }

  const appt = await getAppointmentByToken(env.DB, token);
  if (!appt) return json({ ok: false, reason: 'Appointment not found.' });

  if (!isActive(appt.status)) {
    return json({ ok: true, message: 'This appointment is already cancelled or processed.' });
  }

  const now = nowIso(env.TIMEZONE);
  const cfg = await getConfig(env.DB);

  if (act === 'cancel') {
    await updateAppointmentStatus(env.DB, appt.id, {
      status: 'CANCELLED_DOCTOR',
      cancelled_at: now,
      cancel_reason: 'Cancelled by doctor',
      calendar_event_id: '',
    }, now);
    await bumpVersion(env.DB);

    const ctx = (globalThis as any).__ctx;
    if (ctx?.waitUntil) {
      ctx.waitUntil((async () => {
        if (appt.calendar_event_id) {
          try { await deleteCalendarEvent(env, appt.calendar_event_id, appt.clinic as any); } catch {}
        }
        try { await sendClientCancelledEmail(env, appt, 'Your appointment has been cancelled by the clinic. Please rebook if needed.'); } catch {}
        try { await sendDoctorCancellationEmail(env, appt, 'You cancelled this appointment.'); } catch {}
        try {
          const doId = env.REALTIME.idFromName('global');
          const stub = env.REALTIME.get(doId);
          await stub.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key }),
          });
        } catch {}
      })());
    }

    return json({ ok: true, message: 'Appointment cancelled and patient notified.' });
  }

  if (act === 'redirect') {
    const spinolaLocation = cfg.spinolaLocation;

    // Update original appointment
    await updateAppointmentStatus(env.DB, appt.id, {
      status: 'RELOCATED_SPINOLA',
      location: spinolaLocation,
    }, now);

    // Create mirrored entry in spinola clinic
    const spinolaAppt = {
      id: appt.id, // same ID for traceability
      date_key: appt.date_key,
      start_time: appt.start_time,
      end_time: appt.end_time,
      service_id: appt.service_id,
      service_name: appt.service_name,
      full_name: appt.full_name,
      email: appt.email,
      phone: appt.phone,
      comments: appt.comments,
      status: 'RELOCATED_SPINOLA' as const,
      location: spinolaLocation,
      clinic: 'spinola' as const,
      created_at: appt.created_at,
      updated_at: now,
      token: appt.token,
      calendar_event_id: '',
      cancelled_at: '',
      cancel_reason: '',
    };

    // Use a new ID for the spinola copy to avoid primary key conflict
    const spinolaCopy = { ...spinolaAppt, id: 'A-' + generateId() };
    try { await insertAppointment(env.DB, spinolaCopy); } catch {}

    await bumpVersion(env.DB);

    const ctx = (globalThis as any).__ctx;
    if (ctx?.waitUntil) {
      ctx.waitUntil((async () => {
        // Delete old Potter's calendar event, create new Spinola one
        if (appt.calendar_event_id) {
          try { await deleteCalendarEvent(env, appt.calendar_event_id, 'potters'); } catch {}
        }
        try {
          const eventId = await createCalendarEvent(env, spinolaCopy);
          if (eventId) {
            await env.DB.prepare('UPDATE appointments SET calendar_event_id = ? WHERE id = ?').bind(eventId, spinolaCopy.id).run();
          }
        } catch {}
        try { await sendRedirectToSpinolaEmail(env, appt, spinolaLocation); } catch {}
        try { await sendDoctorCancellationEmail(env, appt, 'Appointment redirected to ' + spinolaLocation + '.'); } catch {}
        try {
          const doId = env.REALTIME.idFromName('global');
          const stub = env.REALTIME.get(doId);
          await stub.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify({ type: 'slots_updated', dateKey: appt.date_key }),
          });
        } catch {}
      })());
    }

    return json({ ok: true, message: 'Appointment redirected to ' + spinolaLocation + ' and patient notified.' });
  }

  return json({ ok: false, reason: 'Unknown action: ' + act }, 400);
}
