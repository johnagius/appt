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

import { generateReferralCode } from '../db/queries';

function buildFooter(appt: Appointment): string {
  const code = generateReferralCode(appt.email);
  const referralUrl = 'https://kevappts.labrint.workers.dev/?ref=' + code;
  const shareText = encodeURIComponent(
    'I saw Dr Kevin at Potter\u2019s Pharmacy in St Julian\u2019s \u2014 really recommend. You can book here: ' + referralUrl
  );
  const whatsappUrl = 'https://wa.me/?text=' + shareText;

  return `
  <div style="margin-top:20px;">
    <table style="border-collapse:collapse;width:100%;"><tr>
      <td style="padding:4px 4px 4px 0;width:50%;">
        <a href="https://kevappts.labrint.workers.dev/" style="display:block;text-align:center;background:#2563eb;color:#fff;text-decoration:none;padding:12px 8px;border-radius:999px;font-weight:700;font-size:14px;">Book an Appointment</a>
      </td>
      <td style="padding:4px 0 4px 4px;width:50%;">
        <a href="${whatsappUrl}" target="_blank" style="display:block;text-align:center;background:#25D366;color:#fff;text-decoration:none;padding:12px 8px;border-radius:999px;font-weight:700;font-size:14px;">Share with a friend</a>
      </td>
    </tr></table>
  </div>`;
}

function buildCalendarLinks(appt: Appointment): string {
  const dtStart = appt.date_key.replace(/-/g, '') + 'T' + appt.start_time.replace(':', '') + '00';
  const dtEnd = appt.date_key.replace(/-/g, '') + 'T' + appt.end_time.replace(':', '') + '00';
  const title = encodeURIComponent('Doctor Appointment - ' + appt.service_name);
  const loc = encodeURIComponent(appt.location);
  const details = encodeURIComponent(appt.service_name + ' at ' + appt.location);

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&location=${loc}&details=${details}`;

  const shareText = encodeURIComponent(
    `I have a doctor's appointment:\n${appt.service_name}\n${appt.date_key} at ${appt.start_time}\n${appt.location}\n\nBook your own appointment: https://kevappts.labrint.workers.dev/`
  );
  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  return `
  <div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="padding:4px 4px 4px 0;width:50%;">
        <a href="${googleUrl}" target="_blank" style="display:block;text-align:center;background:#1a73e8;color:#fff;text-decoration:none;padding:10px 8px;border-radius:999px;font-weight:700;font-size:14px;">📅 Add to Calendar</a>
      </td>
      <td style="padding:4px 0 4px 4px;width:50%;">
        <a href="${whatsappUrl}" target="_blank" style="display:block;text-align:center;background:#25D366;color:#fff;text-decoration:none;padding:10px 8px;border-radius:999px;font-weight:700;font-size:14px;">💬 Let someone know</a>
      </td>
    </tr></table>
  </div>`;
}

async function buildRescheduleLink(env: Env, token: string): Promise<string> {
  const sig = await computeSig('reschedule|' + token, env.SIGNING_SECRET);
  return getBaseUrl(env) + '/reschedule?token=' + encodeURIComponent(token) + '&sig=' + encodeURIComponent(sig);
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

function buildManageSection(cancelUrl: string, rescheduleUrl: string): string {
  return `
  <div style="margin-top:14px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
    <p style="margin:0 0 10px 0;color:#111827;"><b>Manage your appointment</b></p>
    <table style="border-collapse:collapse;width:100%;"><tr>
      <td style="padding:4px 4px 4px 0;width:50%;">
        <a href="${rescheduleUrl}" style="display:block;text-align:center;background:#f5b301;color:#fff;text-decoration:none;padding:10px 8px;border-radius:999px;font-weight:700;font-size:14px;">Reschedule</a>
      </td>
      <td style="padding:4px 0 4px 4px;width:50%;">
        <a href="${cancelUrl}" style="display:block;text-align:center;background:#ef4444;color:#fff;text-decoration:none;padding:10px 8px;border-radius:999px;font-weight:700;font-size:14px;">Cancel</a>
      </td>
    </tr></table>
  </div>`;
}

// ─── 1. Client Booking Confirmation ───────────────────────

export async function sendClientConfirmationEmail(env: Env, appt: Appointment): Promise<void> {
  if (!appt.email) return;
  const cancelUrl = await buildCancelLink(env, appt.token);
  const rescheduleUrl = await buildRescheduleLink(env, appt.token);

  const subject = `Appointment Confirmed - ${appt.service_name} (${appt.date_key} ${appt.start_time})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Confirmed</h2>
  <p style="margin:0 0 10px 0;">Your appointment with <b>Dr Kevin</b> has been confirmed.</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Doctor</td><td style="padding:6px 0;"><b>Dr Kevin</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(appt.location)}</b></td></tr>
  </table>
  ${getMapHtml(appt.location)}
  ${buildManageSection(cancelUrl, rescheduleUrl)}
  ${buildCalendarLinks(appt)}
  ${buildFooter(appt)}
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 2. Spinola Booking Confirmation ──────────────────────

export async function sendSpinolaConfirmationEmail(env: Env, appt: Appointment): Promise<void> {
  if (!appt.email) return;
  const cancelUrl = await buildCancelLink(env, appt.token);
  const rescheduleUrl = await buildRescheduleLink(env, appt.token);
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
  ${buildManageSection(cancelUrl, rescheduleUrl)}
  ${buildCalendarLinks(appt)}
  ${buildFooter(appt)}
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
  ${buildFooter(appt)}
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
  const cancelUrl = await buildCancelLink(env, appt.token);
  const rescheduleUrl = await buildRescheduleLink(env, appt.token);

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
  ${getMapHtml(spinolaLocation)}
  ${buildManageSection(cancelUrl, rescheduleUrl)}
  ${buildFooter(appt)}
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 7. Appointment Rescheduled Notification ──────────────

export async function sendAppointmentPushedEmail(env: Env, appt: Appointment, newDateKey: string, newStartTime: string, newEndTime: string): Promise<void> {
  if (!appt.email) return;
  const cancelUrl = await buildCancelLink(env, appt.token);
  const rescheduleUrl = await buildRescheduleLink(env, appt.token);

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
  <p style="margin:14px 0 0 0;color:#6b7280;font-size:12px;">If this new time does not work for you, use the buttons below.</p>
  ${buildManageSection(cancelUrl, rescheduleUrl)}
  ${buildFooter(appt)}
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── Appointment Reminder (30 min before) ─────────────────

export async function sendReminderEmail(env: Env, appt: Appointment): Promise<void> {
  if (!appt.email) return;
  const cancelUrl = await buildCancelLink(env, appt.token);
  const rescheduleUrl = await buildRescheduleLink(env, appt.token);
  const confirmUrl = getBaseUrl(env) + '/confirm?token=' + encodeURIComponent(appt.token);

  // Calculate actual minutes until appointment
  const tz = env.TIMEZONE;
  const now = new Date();
  const maltaNow = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const nowMin = maltaNow.getHours() * 60 + maltaNow.getMinutes();
  const apptMin = parseInt(appt.start_time.split(':')[0]) * 60 + parseInt(appt.start_time.split(':')[1]);
  const minsUntil = Math.max(0, apptMin - nowMin);
  const timeLabel = minsUntil > 0 ? minsUntil + ' minutes' : 'shortly';

  const subject = "Reminder: Your appointment is in " + timeLabel + " - " + appt.start_time;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Appointment Reminder</h2>
  <p style="margin:0 0 10px 0;">Your appointment is coming up in <b>${timeLabel}</b>.</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(appt.location)}</b></td></tr>
  </table>
  ${getMapHtml(appt.location)}
  <div style="margin-top:14px;">
    <table style="border-collapse:collapse;width:100%;max-width:520px;"><tr>
      <td style="padding:4px 4px 4px 0;width:33%;"><a href="${confirmUrl}" style="display:block;text-align:center;background:#10b981;color:#fff;text-decoration:none;padding:12px 8px;border-radius:999px;font-weight:700;font-size:14px;">I'm Coming</a></td>
      <td style="padding:4px;width:33%;"><a href="${rescheduleUrl}" style="display:block;text-align:center;background:#f5b301;color:#fff;text-decoration:none;padding:12px 8px;border-radius:999px;font-weight:700;font-size:14px;">Reschedule</a></td>
      <td style="padding:4px 0 4px 4px;width:33%;"><a href="${cancelUrl}" style="display:block;text-align:center;background:#ef4444;color:#fff;text-decoration:none;padding:12px 8px;border-radius:999px;font-weight:700;font-size:14px;">Cancel</a></td>
    </tr></table>
  </div>
  <p style="margin:14px 0 0 0;color:#6b7280;font-size:12px;">Please confirm, reschedule or cancel so the doctor can prepare accordingly.</p>
  ${buildFooter(appt)}
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
  ${buildFooter(appt)}
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
    : 'https://search.google.com/local/writereview?placeid=ChIJ3dCu7mtFDhMRYBPbRR0pgtE'; // TODO: Replace with actual Spinola place ID when available

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

// ─── 12. Post-Visit Follow-up Email ────────────────────────

export async function sendFollowUpEmail(env: Env, appt: Appointment): Promise<void> {
  if (!appt.email) return;

  const firstName = (appt.full_name || '').split(' ')[0] || 'there';
  const clinic = appt.clinic || 'potters';
  const doctorName = clinic === 'spinola' ? (env.SPINOLA_DOCTOR_NAME || 'Dr James') : 'Dr Kevin';
  const baseUrl = getBaseUrl(env);
  const sig = await computeSig('followup|' + appt.id, env.SIGNING_SECRET);
  const responseBase = baseUrl + '/followup?id=' + encodeURIComponent(appt.id) + '&sig=' + encodeURIComponent(sig) + '&c=' + clinic;

  const greatUrl = responseBase + '&r=great';
  const questionUrl = responseBase + '&r=question';
  const rebookUrl = responseBase + '&r=rebook';

  const subject = `How are you feeling, ${firstName}? \u2014 ${doctorName}`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:520px;">
  <h2 style="margin:0 0 14px 0;font-size:18px;">Hi ${escapeHtml(firstName)},</h2>
  <p style="margin:0 0 14px 0;font-size:15px;">
    ${escapeHtml(doctorName)} wanted to check in after your visit yesterday.
    Hope everything is going well!
  </p>
  <p style="margin:0 0 18px 0;font-size:15px;">How are you feeling?</p>
  <table style="border-collapse:collapse;width:100%;"><tr>
    <td style="padding:4px;">
      <a href="${greatUrl}" style="display:block;text-align:center;background:#10b981;color:#fff;text-decoration:none;padding:14px 8px;border-radius:14px;font-weight:700;font-size:15px;">
        Everything's great
      </a>
    </td>
  </tr><tr>
    <td style="padding:4px;">
      <a href="${questionUrl}" style="display:block;text-align:center;background:#3b82f6;color:#fff;text-decoration:none;padding:14px 8px;border-radius:14px;font-weight:700;font-size:15px;">
        I have a question
      </a>
    </td>
  </tr><tr>
    <td style="padding:4px;">
      <a href="${rebookUrl}" style="display:block;text-align:center;background:#f5b301;color:#fff;text-decoration:none;padding:14px 8px;border-radius:14px;font-weight:700;font-size:15px;">
        I need another appointment
      </a>
    </td>
  </tr></table>
  <p style="margin:18px 0 0 0;color:#6b7280;font-size:13px;">
    If you need urgent help, please call the clinic directly.
  </p>
</div>`;

  await sendEmail(env, appt.email, subject, html);
}

// ─── 13. Referral Thank You Email ──────────────────────────

export async function sendReferralThankYouEmail(env: Env, referrerEmail: string, referrerName: string, friendName: string): Promise<void> {
  if (!referrerEmail) return;

  const firstName = (referrerName || '').split(' ')[0] || 'there';
  const friendFirst = (friendName || '').split(' ')[0] || 'someone';

  const subject = `Thank you, ${firstName}!`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:520px;">
  <h2 style="margin:0 0 14px 0;font-size:18px;">Thank you, ${escapeHtml(firstName)}!</h2>
  <p style="margin:0 0 14px 0;font-size:15px;">
    Your friend <b>${escapeHtml(friendFirst)}</b> just booked their first appointment with us.
    We really appreciate you spreading the word!
  </p>
  <p style="margin:0 0 14px 0;font-size:15px;">
    It means a lot to the whole team at Potter\u2019s Pharmacy.
  </p>
  <p style="margin:0;color:#6b7280;font-size:13px;">
    \u2014 Dr Kevin and the Potter\u2019s Pharmacy team
  </p>
</div>`;

  await sendEmail(env, referrerEmail, subject, html);
}
