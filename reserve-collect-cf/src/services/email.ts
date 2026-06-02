/** Email service using Resend API. Same wrapper + sender identity as the
 *  appointment app (kevappts) so branding stays consistent. */
import type { Env, Reservation, ReservationItem } from '../types';
import { escapeHtml } from './utils';

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

function layout(env: Env, title: string, body: string): string {
  return `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:8px;color:#111827;">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 10px 30px rgba(17,24,39,0.08);overflow:hidden;">
      <div style="background:#111827;padding:18px 22px;">
        <div style="color:#f5b301;font-weight:900;font-size:18px;">${escapeHtml(env.PHARMACY_NAME)}</div>
        <div style="color:#cbd5e1;font-size:13px;margin-top:2px;">Reserve &amp; Collect</div>
      </div>
      <div style="padding:22px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">${escapeHtml(title)}</h1>
        ${body}
        <div style="margin-top:22px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <a href="${env.APPOINTMENTS_URL}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:11px 16px;border-radius:999px;font-weight:700;font-size:14px;">Need a doctor, physio or blood test? Book an appointment</a>
        </div>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:14px;">This is an automated message from ${escapeHtml(env.PHARMACY_NAME)}. Please do not reply.</p>
  </div>`;
}

function itemsTable(items: ReservationItem[]): string {
  const rows = items.map(it => {
    const label = STATUS_LABEL[it.item_status] || it.item_status;
    const color = STATUS_COLOR[it.item_status] || '#6b7280';
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;">${escapeHtml(it.item_name)}${it.quantity > 1 ? ' <span style="color:#6b7280;">×' + it.quantity + '</span>' : ''}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;"><span style="color:${color};font-weight:700;font-size:13px;">${escapeHtml(label)}</span></td>
    </tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:12px 0;">${rows}</table>`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Being checked',
  AVAILABLE: 'Available',
  RESERVED_ALREADY: 'Reserved already',
  UNAVAILABLE: 'Unavailable',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#6b7280',
  AVAILABLE: '#10b981',
  RESERVED_ALREADY: '#f59e0b',
  UNAVAILABLE: '#ef4444',
};

export async function sendOtpEmail(env: Env, to: string, code: string): Promise<void> {
  const body = `
    <p style="margin:0 0 14px;color:#374151;">Use this code to sign in and verify your email. It expires in 10 minutes.</p>
    <div style="text-align:center;margin:18px 0;">
      <span style="display:inline-block;font-size:34px;letter-spacing:10px;font-weight:900;color:#111827;background:#f6f7fb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 22px;">${escapeHtml(code)}</span>
    </div>
    <p style="margin:0;color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`;
  await sendEmail(env, to, `${code} is your ${env.PHARMACY_NAME} verification code`, layout(env, 'Verify your email', body));
}

export async function sendReservationReceivedEmail(env: Env, r: Reservation, items: ReservationItem[]): Promise<void> {
  const body = `
    <p style="margin:0 0 6px;color:#374151;">Hi ${escapeHtml(r.customer_name || 'there')}, we've received your reservation. Our team will check availability and let you know when it's ready to collect in-store.</p>
    <p style="margin:10px 0 0;color:#111827;">Collection reference: <b style="font-size:16px;">${escapeHtml(r.reference)}</b></p>
    ${itemsTable(items)}
    ${r.notes ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px;"><b>Your note:</b> ${escapeHtml(r.notes)}</p>` : ''}
    <p style="margin:14px 0 0;color:#6b7280;font-size:13px;">We'll email you again as soon as there's an update. No payment is taken online — you pay in-store at collection.</p>`;
  await sendEmail(env, r.customer_email, `We've received your reservation (${r.reference})`, layout(env, 'Reservation received', body));
}

export async function sendReadyForCollectionEmail(env: Env, r: Reservation, items: ReservationItem[]): Promise<void> {
  const available = items.filter(i => i.item_status === 'AVAILABLE');
  const notAvailable = items.filter(i => i.item_status === 'UNAVAILABLE' || i.item_status === 'RESERVED_ALREADY');
  const body = `
    <p style="margin:0 0 6px;color:#374151;">Good news ${escapeHtml(r.customer_name || '')} — your reservation is ready to collect at ${escapeHtml(env.PHARMACY_NAME)}.</p>
    <p style="margin:10px 0 0;color:#111827;">Show this reference at the counter: <b style="font-size:16px;">${escapeHtml(r.reference)}</b></p>
    ${itemsTable(items)}
    ${notAvailable.length ? `<p style="margin:8px 0 0;color:#b45309;font-size:13px;">Note: ${notAvailable.length} item(s) couldn't be supplied this time and aren't included.</p>` : ''}
    ${available.length === 0 ? `<p style="margin:8px 0 0;color:#ef4444;">Unfortunately none of your items are available right now.</p>` : ''}`;
  await sendEmail(env, r.customer_email, `Ready to collect: ${r.reference}`, layout(env, 'Ready for collection', body));
}

export async function sendUnavailableEmail(env: Env, r: Reservation, items: ReservationItem[]): Promise<void> {
  const body = `
    <p style="margin:0 0 6px;color:#374151;">Hi ${escapeHtml(r.customer_name || '')}, we're sorry — we're unable to supply the items on this reservation right now.</p>
    ${itemsTable(items)}
    <p style="margin:10px 0 0;color:#6b7280;font-size:13px;">Reference ${escapeHtml(r.reference)}. Please contact or visit us if you'd like alternatives or more information.</p>`;
  await sendEmail(env, r.customer_email, `Update on your reservation (${r.reference})`, layout(env, 'Item unavailable', body));
}

export async function sendCustomNotificationEmail(env: Env, r: Reservation, message: string): Promise<void> {
  const body = `
    <p style="margin:0 0 6px;color:#374151;white-space:pre-wrap;">${escapeHtml(message)}</p>
    <p style="margin:12px 0 0;color:#6b7280;font-size:13px;">Reference ${escapeHtml(r.reference)}.</p>`;
  await sendEmail(env, r.customer_email, `A message about your reservation (${r.reference})`, layout(env, 'Message from ' + env.PHARMACY_NAME, body));
}

export async function sendStaffNewReservationEmail(env: Env, r: Reservation, items: ReservationItem[]): Promise<void> {
  if (!env.STAFF_EMAIL) return;
  const body = `
    <p style="margin:0 0 6px;color:#374151;">A new reservation needs review.</p>
    <p style="margin:0;color:#111827;"><b>${escapeHtml(r.customer_name)}</b> — ${escapeHtml(r.customer_email)}${r.customer_phone ? ' — ' + escapeHtml(r.customer_phone) : ''}</p>
    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Reference ${escapeHtml(r.reference)}${r.preferred_day ? ' • prefers ' + escapeHtml(r.preferred_day) + ' ' + escapeHtml(r.preferred_time) : ''}</p>
    ${itemsTable(items)}
    ${r.notes ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px;"><b>Customer note:</b> ${escapeHtml(r.notes)}</p>` : ''}
    <p style="margin:14px 0 0;"><a href="${env.PUBLIC_BASE_URL}/admin" style="display:inline-block;background:#f5b301;color:#111827;text-decoration:none;padding:11px 16px;border-radius:999px;font-weight:800;font-size:14px;">Open dashboard</a></p>`;
  await sendEmail(env, env.STAFF_EMAIL, `New reservation: ${r.reference} (${r.customer_name})`, layout(env, 'New reservation', body));
}
