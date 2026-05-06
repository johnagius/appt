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

// ─── 2b. Linda (Physiotherapy) Booking Confirmation ───────

export async function sendLindaConfirmationEmail(env: Env, appt: Appointment): Promise<void> {
  if (!appt.email) return;
  const cancelUrl = await buildCancelLink(env, appt.token);
  const rescheduleUrl = await buildRescheduleLink(env, appt.token);
  const physioName = env.LINDA_DOCTOR_NAME || 'Linda';
  const location = appt.location || env.LINDA_LOCATION || "Potter's Clinic";

  const subject = `Appointment Confirmed - ${physioName} Physiotherapy (${appt.date_key} ${appt.start_time})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">Physiotherapy Appointment Confirmed</h2>
  <p style="margin:0 0 10px 0;">Your appointment with <b>${escapeHtml(physioName)}</b>, Physiotherapist, has been confirmed.</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>${escapeHtml(appt.service_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Physiotherapist</td><td style="padding:6px 0;"><b>${escapeHtml(physioName)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(appt.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;"><b>${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;"><b>${escapeHtml(location)}</b></td></tr>
  </table>
  ${getMapHtml(location)}
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

export async function sendReviewRequestEmail(env: Env, appt: Appointment, location: 'potters' | 'spinola' | 'linda', _teamNames: string[] = []): Promise<void> {
  if (!appt.email) return;

  const firstName = (appt.full_name || '').split(' ')[0] || 'there';
  // "placeName" is the clinic/service name that appears in the sign-off and
  // footer. We shape it per clinic so it reads naturally in the copy.
  const placeName =
    location === 'potters' ? "Potter's Pharmacy Clinic"
    : location === 'spinola' ? 'Spinola Clinic'
    : "Potter's Pharmacy Clinic";
  // For Linda we sign off with her name explicitly — she's solo, not "the team".
  const signOff =
    location === 'linda'
      ? `${env.LINDA_DOCTOR_NAME || 'Linda'} at Potter's Pharmacy Clinic`
      : `The team at ${placeName}`;

  const reviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJ3dCu7mtFDhMRYBPbRR0pgtE';

  const subject = 'A small favour, big impact';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  /* Mobile: full-width button, tighter padding */
  @media only screen and (max-width: 480px) {
    .card-pad { padding: 28px 22px !important; }
    .cta-btn  { padding: 20px 24px !important; width: 100% !important; box-sizing: border-box; display: block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
  <tr><td style="height:6px;background:linear-gradient(90deg,#10b981 0%,#059669 100%);"></td></tr>
  <tr><td class="card-pad" style="padding:40px 36px 36px;">

    <h1 style="margin:0 0 22px;font-size:22px;font-weight:800;color:#111827;line-height:1.3;letter-spacing:-0.2px;">
      Hi ${escapeHtml(firstName)},
    </h1>

    <p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#374151;">
      Thank you for trusting us with your care today.
    </p>

    <p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#374151;">
      Your review on Google could be the reason another family finds us when they need care most.
    </p>

    <p style="margin:0 0 32px;font-size:16px;line-height:1.65;color:#374151;">
      It only takes <b>20 seconds</b> — but it means the world to us. It encourages us to keep improving and helps us reach more people who need care.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr><td align="center">
        <a href="${reviewUrl}" class="cta-btn"
           style="display:inline-block;text-align:center;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;padding:20px 42px;border-radius:999px;font-size:17px;font-weight:800;letter-spacing:0.3px;box-shadow:0 8px 24px rgba(16,185,129,0.42);min-width:240px;">
          <span style="display:block;font-size:22px;letter-spacing:8px;margin-bottom:6px;color:#FBBF24;line-height:1;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span style="display:block;font-size:17px;line-height:1;">Leave a Google review</span>
        </a>
      </td></tr>
    </table>

    <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">Thank you,</p>
    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(signOff)}</p>

  </td></tr>
  <tr><td style="padding:14px 36px 20px;background:#f9fafb;border-top:1px solid #f3f4f6;">
    <p style="margin:0;font-size:11px;line-height:1.55;color:#9ca3af;text-align:center;">
      You're getting this because you had an appointment with ${escapeHtml(placeName)}.
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
  const doctorName = clinic === 'spinola'
    ? (env.SPINOLA_DOCTOR_NAME || 'Dr James')
    : clinic === 'linda'
      ? (env.LINDA_DOCTOR_NAME || 'Linda')
      : 'Dr Kevin';
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

// ─── 13a. Telemedicine — Doctor / Clinic Notification ─────

const TELEMEDICINE_RECIPIENT = 'info@spinolaclinic.com';

export interface TelemedicineCallSummary {
  id: string;
  date_key: string;
  patient_name: string;
  phone: string;
  email: string;
  comments: string;
  fee_cents: number;
  source: string;
  created_at: string;
}

function feeLabel(cents: number): string {
  const eur = (cents / 100).toFixed(2);
  return '€' + eur;
}

export async function sendTelemedicineDoctorEmail(env: Env, call: TelemedicineCallSummary): Promise<void> {
  const subject = `Telemedicine call: ${call.patient_name} (${call.date_key} ${call.created_at.split(' ')[1] || ''})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111827;">
  <h2 style="margin:0 0 10px 0;">New Telemedicine Call</h2>
  <p style="margin:0 0 10px 0;">A patient has booked an evening telemedicine call.</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Patient</td><td style="padding:6px 0;"><b>${escapeHtml(call.patient_name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><b>${escapeHtml(call.phone)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><b>${escapeHtml(call.email || '—')}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(call.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Logged at</td><td style="padding:6px 0;"><b>${escapeHtml(call.created_at)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Fee</td><td style="padding:6px 0;"><b>${feeLabel(call.fee_cents)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Booked via</td><td style="padding:6px 0;"><b>${escapeHtml(call.source === 'admin' ? 'Admin entry' : 'Patient booking page')}</b></td></tr>
    ${call.comments ? `<tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Notes</td><td style="padding:6px 0;">${escapeHtml(call.comments)}</td></tr>` : ''}
  </table>
  <p style="margin:16px 0 0 0;color:#6b7280;font-size:13px;">Please call the patient on the number above. Telemedicine calls run 8pm–midnight at the flat rate of €25.</p>
</div>`;

  await sendEmail(env, TELEMEDICINE_RECIPIENT, subject, html);
}

export async function sendTelemedicinePatientEmail(env: Env, call: TelemedicineCallSummary): Promise<void> {
  if (!call.email) return;
  const subject = `Telemedicine call confirmed (${call.date_key})`;
  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:520px;">
  <h2 style="margin:0 0 12px 0;font-size:18px;">Your telemedicine call is booked</h2>
  <p style="margin:0 0 12px 0;font-size:15px;">Thanks ${escapeHtml((call.patient_name || '').split(' ')[0] || 'there')}—the doctor will phone you on <b>${escapeHtml(call.phone)}</b> as soon as they’re free this evening (between 8pm and midnight).</p>
  <table style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Date</td><td style="padding:6px 0;"><b>${escapeHtml(call.date_key)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;"><b>Telemedicine call</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Fee</td><td style="padding:6px 0;"><b>${feeLabel(call.fee_cents)}</b> (paid to doctor on the call)</td></tr>
  </table>
  <p style="margin:16px 0 0 0;color:#6b7280;font-size:13px;">If you no longer need the call, please reply to this email so the doctor isn’t calling unnecessarily.</p>
</div>`;
  await sendEmail(env, call.email, subject, html);
}

// ─── 13b. Telemedicine — Prescription / Receipt ───────────
//
// Professional, print-friendly format suitable for an insurance claim.
// The doctor's fee (€25) and the medicine fee (entered by admin) are
// always shown as separate line items so the patient can show the bill
// to their insurer. We never store per-medicine prices — only the
// `medicineCents` total entered in admin.

export interface TelemedicinePrescriptionPayload {
  id: string;
  date_key: string;
  patient_name: string;
  phone: string;
  email: string;
  fee_cents: number;
  medicine_cents: number;
  medicines: string;       // newline-separated medicine names
  created_at: string;
}

export async function sendTelemedicinePrescriptionEmail(env: Env, p: TelemedicinePrescriptionPayload): Promise<void> {
  if (!p.email) throw new Error('Patient email is required to send a prescription.');

  const fee = (p.fee_cents || 0) / 100;
  const med = (p.medicine_cents || 0) / 100;
  const total = fee + med;
  const today = (p.created_at || '').split(' ')[0] || p.date_key;

  // Split the medicines blob into clean lines. Skip empties so admins can
  // be loose with whitespace; render each as a styled <li>.
  const items = (p.medicines || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
  const medicineList = items.length
    ? '<ol style="margin:6px 0 0 0;padding-left:22px;font-size:14.5px;line-height:1.7;color:#111827;">' +
        items.map(m => '<li style="margin-bottom:4px;">' + escapeHtml(m) + '</li>').join('') +
      '</ol>'
    : '<p style="margin:8px 0 0 0;color:#6b7280;font-style:italic;">No medicines prescribed.</p>';

  // Doctor identity for the prescription footer. Reg No. is fixed by the
  // doctor's medical council registration — kept here as a constant so the
  // patient's prescription matches their insurance paperwork. Falls back to
  // env.DOCTOR_NAME for the printed name in case it's tweaked.
  const doctorName = env.DOCTOR_NAME || 'Dr Kevin Navarro Gera';
  const doctorReg = 'Reg No. 1985';

  const subject = `Prescription & Receipt — Dr Kevin Navarro Gera (${today})`;
  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f9fafb;padding:24px 0;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06);">
    <div style="background:#0f172a;color:#fff;padding:22px 28px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">
        <div>
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;">Telemedicine consultation</div>
          <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.01em;">Prescription &amp; Receipt</h1>
        </div>
        <div style="text-align:right;font-size:13px;color:#cbd5e1;line-height:1.4;">
          <div style="font-weight:700;color:#fff;">${escapeHtml(doctorName)}</div>
          <div>${escapeHtml(doctorReg)}</div>
        </div>
      </div>
    </div>

    <div style="padding:22px 28px 8px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;width:140px;">Date issued</td>
          <td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(today)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Patient</td>
          <td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(p.patient_name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Phone</td>
          <td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(p.phone)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Reference</td>
          <td style="padding:8px 0;color:#111827;font-weight:700;">${escapeHtml(p.id)}</td>
        </tr>
      </table>
    </div>

    <div style="padding:14px 28px 6px;">
      <div style="border-top:1px solid #e5e7eb;padding-top:14px;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9a3412;font-weight:800;">Prescription</div>
        ${medicineList}
      </div>
    </div>

    <div style="padding:18px 28px 6px;">
      <div style="border-top:1px solid #e5e7eb;padding-top:14px;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:800;margin-bottom:8px;">Bill</div>
        <table style="width:100%;border-collapse:collapse;font-size:14.5px;">
          <tr>
            <td style="padding:8px 0;color:#374151;">Doctor's consultation fee (telemedicine)</td>
            <td style="padding:8px 0;text-align:right;color:#111827;font-weight:700;white-space:nowrap;">€${fee.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151;border-top:1px dashed #e5e7eb;">Medicines (pharmacy total)</td>
            <td style="padding:8px 0;text-align:right;color:#111827;font-weight:700;white-space:nowrap;border-top:1px dashed #e5e7eb;">€${med.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0 4px;border-top:2px solid #0f172a;color:#0f172a;font-weight:800;font-size:15px;">Patient total due</td>
            <td style="padding:12px 0 4px;border-top:2px solid #0f172a;text-align:right;color:#0f172a;font-weight:900;font-size:17px;white-space:nowrap;">€${total.toFixed(2)}</td>
          </tr>
        </table>
        <p style="margin:10px 0 0 0;color:#6b7280;font-size:12px;line-height:1.55;">The doctor's fee and the medicines are listed separately so this receipt can be used for an insurance claim.</p>
      </div>
    </div>

    <div style="padding:18px 28px 24px;">
      <div style="border-top:1px solid #e5e7eb;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:14px;">
        <div style="font-size:12px;color:#6b7280;line-height:1.5;max-width:320px;">
          Please follow the dosage agreed during the call. If your symptoms worsen or you experience any reaction, contact a doctor or call 112 immediately.
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Brush Script MT',cursive;font-size:26px;color:#0f172a;line-height:1;margin-bottom:4px;">${escapeHtml(doctorName)}</div>
          <div style="font-size:13px;color:#111827;font-weight:800;">${escapeHtml(doctorName)}</div>
          <div style="font-size:12px;color:#6b7280;">${escapeHtml(doctorReg)}</div>
        </div>
      </div>
    </div>
  </div>

  <p style="max-width:640px;margin:14px auto 0;font-size:11px;color:#9ca3af;text-align:center;">This document is computer-generated. Telemedicine consultation issued under the regulations of the Maltese Medical Council.</p>
</div>`;

  await sendEmail(env, p.email, subject, html);
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
