/**
 * Email service using Resend API.
 * All 10 email templates ported from GAS EmailService.gs.
 */
import type { Env, Appointment } from '../types';
import { escapeHtml } from './utils';
import { computeSig, computeAdminSig } from './crypto';

async function sendEmail(env: Env, to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: "Potter's Pharmacy <noreply@swiftdataautomation.com>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', res.status, text);
  }
}

function getMapUrl(location: string): string {
  if (location.toLowerCase().includes('spinola')) {
    return 'https://www.google.com/maps/search/?api=1&query=Spinola+Clinic+St+Julians+Malta';
  }
  return 'https://www.google.com/maps/search/?api=1&query=Potters+Pharmacy+St+Julians+Malta';
}

function getMapHtml(location: string): string {
  const mapUrl = getMapUrl(location);
  const label = location.toLowerCase().includes('spinola') ? 'Spinola Clinic, St Julians, Malta' : "Potter's Pharmacy, St Julians, Malta";
  return `<div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f0f9ff;">
    <p style="margin:0 0 8px 0;font-weight:700;color:#111827;">Directions</p>
    <a href="${mapUrl}" style="display:inline-flex;align-items:center;gap:6px;background:#1a73e8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700;font-size:14px;">
      Open in Google Maps
    </a>
    <p style="margin:8px 0 0 0;color:#6b7280;font-size:13px;">${label}</p>
  </div>`;
}

function getBaseUrl(env: Env): string {
  return 'https://kevappts.labrint.workers.dev';
}

async function buildCancelLink(env: Env, token: string): Promise<string> {
  const sig = await computeSig('cancel|' + token, env.SIGNING_SECRET);
  return getBaseUrl(env) + '/cancel?token=' + encodeURIComponent(token) + '&sig=' + encodeURIComponent(sig);
}

async function buildDocActionLink(env: Env, token: string, action: string): Promise<string> {
  const sig = await computeSig('docAction|' + token + '|' + action, env.SIGNING_SECRET);
  return getBaseUrl(env) + '/action?token=' + encodeURIComponent(token) + '&act=' + encodeURIComponent(action) + '&sig=' + encodeURIComponent(sig);
}

async function buildAdminLink(env: Env): Promise<string> {
  const sig = await computeAdminSig(env.ADMIN_SECRET);
  return getBaseUrl(env) + '/admin?sig=' + encodeURIComponent(sig);
}

// ─── 1. Client Booking Confirmation ───────────────────────

export async function sendClientConfirmationEmail(env: Env, appt: Appointment): Promise<void> {
  if (!appt.email) return;
  const cancelUrl = await buildCancelLink(env, appt.token);

  const subject = `Appointment Confirmed - ${appt.service_name} (${appt.date_key} ${appt.start_time})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Confirmed</h2>
  <p style="margin:0 0 10px 0;">Your appointment has been confirmed.</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(appt.location)}</b></td></tr>
  </table>
  ${getMapHtml(appt.location)}
  <div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
    <p style="margin:0 0 10px 0;color:#111827;"><b>Cancel appointment</b></p>
    <a href="${cancelUrl}" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Cancel Appointment</a>
    <p style="margin:10px 0 0 0;color:#6b7280;font-size:12px;">If the button does not work, please reply to this email to request cancellation.</p>
  </div>
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 2. Spinola Booking Confirmation ──────────────────────

export async function sendSpinolaConfirmationEmail(env: Env, appt: Appointment): Promise<void> {
  if (!appt.email) return;
  const cancelUrl = await buildCancelLink(env, appt.token);
  const spinolaLocation = appt.location || 'Spinola Clinic';

  const subject = `Appointment Confirmed - Dr James at ${spinolaLocation} (${appt.date_key} ${appt.start_time})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Confirmed - Spinola Clinic</h2>
  <p style="margin:0 0 10px 0;">Your appointment with <b>Dr James</b> at <b>${escapeHtml(spinolaLocation)}</b> has been confirmed.</p>
  <p style="margin:0 0 10px 0;color:#6b7280;font-size:13px;">Location: ${escapeHtml(env.SPINOLA_LOCATION_DETAILS)}</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Doctor</td><td style="padding:6px 0;"><b>Dr James</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(spinolaLocation)}</b></td></tr>
  </table>
  ${getMapHtml(spinolaLocation)}
  <div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
    <p style="margin:0 0 10px 0;color:#111827;"><b>Cancel appointment</b></p>
    <a href="${cancelUrl}" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Cancel Appointment</a>
    <p style="margin:10px 0 0 0;color:#6b7280;font-size:12px;">If the button does not work, please reply to this email to request cancellation.</p>
  </div>
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 3. Doctor New Booking Notification ───────────────────

export async function sendDoctorBookingEmail(env: Env, appt: Appointment, dayList: Appointment[]): Promise<void> {
  if (!env.DOCTOR_EMAIL) return;

  const active = dayList.filter(a => a.status === 'BOOKED' || a.status === 'RELOCATED_SPINOLA')
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  let rowsHtml = '';
  for (const a of active) {
    const cancelLink = await buildDocActionLink(env, a.token, 'cancel');
    const redirectLink = await buildDocActionLink(env, a.token, 'redirect');
    rowsHtml += `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.start_time)} - ${escapeHtml(a.end_time)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.service_name)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.full_name)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.phone)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">
          <a href="${cancelLink}" style="color:#ef4444;font-size:12px;">Cancel</a> |
          <a href="${redirectLink}" style="color:#10b981;font-size:12px;">Spinola</a>
        </td>
      </tr>`;
  }
  if (!rowsHtml) {
    rowsHtml = '<tr><td colspan="5" style="padding:8px;color:#6b7280;">No active appointments found.</td></tr>';
  }

  const subject = `New Booking: ${appt.service_name} - ${appt.date_key} ${appt.start_time}`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">New Appointment Booked</h2>
  <table style="border-collapse:collapse;width:100%;max-width:620px;">
    <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;"><b>${escapeHtml(appt.full_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><b>${escapeHtml(appt.phone)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><b>${escapeHtml(appt.email)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(appt.location)}</b></td></tr>
  </table>
  <h3 style="margin:16px 0 8px 0;">Appointments for the day</h3>
  <table style="border-collapse:collapse;width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Time</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Service</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Phone</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Actions</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</div>`;

  await sendEmail(env, env.DOCTOR_EMAIL, subject, html);
}

// ─── 4. Client Cancellation Confirmation ──────────────────

export async function sendClientCancelledEmail(env: Env, appt: Appointment, messageText: string): Promise<void> {
  if (!appt.email) return;
  const bookingUrl = getBaseUrl(env);

  const subject = `Appointment Cancelled - ${appt.service_name} (${appt.date_key} ${appt.start_time})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Cancelled</h2>
  <p style="margin:0 0 10px 0;">${escapeHtml(messageText)}</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(appt.location)}</b></td></tr>
  </table>
  <p style="margin:14px 0 0 0;"><a href="${bookingUrl}" style="color:#2563eb;">Book a new appointment</a></p>
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 5. Doctor Cancellation Notification ──────────────────

export async function sendDoctorCancellationEmail(env: Env, appt: Appointment, messageText: string): Promise<void> {
  if (!env.DOCTOR_EMAIL) return;

  const subject = `Appointment Cancelled: ${appt.service_name} - ${appt.date_key} ${appt.start_time}`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Cancelled</h2>
  <p style="margin:0 0 10px 0;">${escapeHtml(messageText)}</p>
  <table style="border-collapse:collapse;width:100%;max-width:620px;">
    <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;"><b>${escapeHtml(appt.full_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><b>${escapeHtml(appt.phone)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><b>${escapeHtml(appt.email)}</b></td></tr>
  </table>
</div>`;

  await sendEmail(env, env.DOCTOR_EMAIL, subject, html);
}

// ─── 6. Redirect to Spinola Notification ──────────────────

export async function sendRedirectToSpinolaEmail(env: Env, appt: Appointment, spinolaLocation: string): Promise<void> {
  if (!appt.email) return;

  const subject = `Appointment Location Changed - ${appt.service_name} (${appt.date_key} ${appt.start_time})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Location Changed</h2>
  <p style="margin:0 0 10px 0;">Your appointment has been moved to <b>${escapeHtml(spinolaLocation)}</b>. The date and time remain the same.</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">New Location</td><td style="padding:6px 0;"><b>${escapeHtml(spinolaLocation)}</b></td></tr>
  </table>
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 7. Appointment Rescheduled Notification ──────────────

export async function sendAppointmentPushedEmail(env: Env, appt: Appointment, newDateKey: string, newStartTime: string, newEndTime: string): Promise<void> {
  if (!appt.email) return;

  const subject = `Appointment Rescheduled - ${appt.service_name} (moved to ${newDateKey} ${newStartTime})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Rescheduled</h2>
  <p style="margin:0 0 10px 0;">Due to doctor unavailability, your appointment has been rescheduled.</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#ef4444;">Original Date</td><td style="padding:6px 0;"><s>${escapeHtml(appt.date_key)} ${escapeHtml(appt.start_time)}</s></td></tr>
    <tr><td style="padding:6px 0;color:#10b981;">New Date</td><td style="padding:6px 0;"><b>${escapeHtml(newDateKey)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#10b981;">New Time</td><td style="padding:6px 0;"><b>${escapeHtml(newStartTime)} - ${escapeHtml(newEndTime)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(appt.location)}</b></td></tr>
  </table>
  <p style="margin:14px 0 0 0;color:#6b7280;font-size:12px;">If this new time does not work for you, please cancel and rebook.</p>
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 8. Daily Doctor Schedule ─────────────────────────────

export async function sendDailyDoctorSchedule(env: Env, todayKey: string, active: Appointment[]): Promise<void> {
  if (!env.DOCTOR_EMAIL) return;

  let rowsHtml = '';
  for (const a of active) {
    rowsHtml += `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.start_time)} - ${escapeHtml(a.end_time)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.service_name)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.full_name)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.phone)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(a.location)}</td>
      </tr>`;
  }
  if (!rowsHtml) {
    rowsHtml = '<tr><td colspan="5" style="padding:8px;color:#6b7280;">No appointments today.</td></tr>';
  }

  let adminLink = '';
  try { adminLink = await buildAdminLink(env); } catch {}

  const subject = `Daily Schedule - ${todayKey} (${active.length} appointment${active.length !== 1 ? 's' : ''})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Daily Schedule - ${escapeHtml(todayKey)}</h2>
  <p style="margin:0 0 10px 0;">${active.length} appointment${active.length !== 1 ? 's' : ''} today.</p>
  <table style="border-collapse:collapse;width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Time</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Service</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Patient</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Phone</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Location</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  ${adminLink ? `<p style="margin:16px 0 0 0;"><a href="${adminLink}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:700;">Open Admin Panel</a></p>` : ''}
</div>`;

  await sendEmail(env, env.DOCTOR_EMAIL, subject, html);
}

// ─── 9. Custom Admin Notification ─────────────────────────

export async function sendCustomNotificationEmail(env: Env, appt: Appointment, customMessage: string): Promise<void> {
  if (!appt.email) return;

  const subject = `Important: Your Appointment on ${appt.date_key} at ${appt.start_time}`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Notice</h2>
  <p style="margin:0 0 10px 0;">${escapeHtml(customMessage)}</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(appt.location)}</b></td></tr>
  </table>
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 10. Google Review Request ────────────────────────────

export async function sendReviewRequestEmail(env: Env, appt: Appointment, location: 'potters' | 'spinola', teamNames: string[]): Promise<void> {
  if (!appt.email) return;

  const firstName = (appt.full_name || '').split(' ')[0] || 'there';
  const isPotters = location === 'potters';
  const placeName = isPotters ? "Potter's Pharmacy" : 'Spinola Clinic';
  const reviewUrl = isPotters
    ? 'https://search.google.com/local/writereview?placeid=ChIJ3dCu7mtFDhMRYBPbRR0pgtE'
    : 'https://search.google.com/local/writereview?placeid=ChIJ3dCu7mtFDhMRYBPbRR0pgtE';

  let teamLine = '';
  if (teamNames.length === 1) teamLine = teamNames[0];
  else if (teamNames.length === 2) teamLine = teamNames[0] + ' &amp; ' + teamNames[1];
  else if (teamNames.length >= 3) teamLine = teamNames.slice(0, -1).join(', ') + ' &amp; ' + teamNames[teamNames.length - 1];

  const accentColor = isPotters ? '#2563eb' : '#8b5cf6';

  const subject = `We'd love your feedback - ${placeName}`;
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="height:6px;background:${accentColor};"></td></tr>
<tr><td style="padding:36px 32px 24px;">
  <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#111827;line-height:1.3;">Thank you for visiting ${escapeHtml(placeName)}!</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Hi ${escapeHtml(firstName)},</p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">We hope you had a great experience with us today. If you were happy with the service, we'd really appreciate it if you could take a moment to leave us a quick Google review.</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">Your feedback helps others discover us and means the world to our team.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:4px 0 28px;">
    <a href="${reviewUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:700;letter-spacing:0.3px;">&#9733; Leave a Review</a>
  </td></tr></table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="border-top:1px solid #e5e7eb;padding-top:20px;">
    <p style="margin:0;font-size:14px;line-height:1.5;color:#6b7280;">Warm regards,</p>
    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111827;">${teamLine}</p>
    <p style="margin:2px 0 0;font-size:13px;color:#9ca3af;">The Potter's Pharmacy Team</p>
  </td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px 24px;background:#f9fafb;border-top:1px solid #f3f4f6;">
  <p style="margin:0;font-size:11px;line-height:1.5;color:#9ca3af;text-align:center;">
    This email was sent because you visited ${escapeHtml(placeName)} today.<br>
    If you received this by mistake, please disregard it.
  </p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  await sendEmail(env, appt.email, subject, html);
}
