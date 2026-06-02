export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;

  // Secrets
  SIGNING_SECRET: string;
  ADMIN_SECRET: string;
  ADMIN_PASSWORD: string;
  RESEND_API_KEY: string;
  // Optional backup email providers — used automatically if Resend fails/quota.
  BREVO_API_KEY: string;
  SMTP2GO_API_KEY: string;
  STAFF_EMAIL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  // Vars
  TIMEZONE: string;
  PHARMACY_NAME: string;
  APPOINTMENTS_URL: string;
  PUBLIC_BASE_URL: string;
  REVIEW_URL: string;
}

export interface User {
  id: string;
  email: string;
  email_verified: number;
  auth_provider: string;
  google_sub: string;
  full_name: string;
  phone: string;
  referral_code: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  revoked_at: string;
  user_agent: string;
}

export interface EmailVerification {
  id: string;
  email: string;
  code_hash: string;
  purpose: string;
  attempts: number;
  expires_at: string;
  consumed_at: string;
  created_at: string;
}

// The customer-facing terms map directly onto item statuses.
export type ItemStatus = 'PENDING' | 'AVAILABLE' | 'RESERVED_ALREADY' | 'UNAVAILABLE';

export type ReservationStatus =
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'READY_FOR_COLLECTION'
  | 'COLLECTED'
  | 'PARTIALLY_UNAVAILABLE'
  | 'CANCELLED';

export interface Reservation {
  id: string;
  reference: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  notes: string;
  staff_note: string;
  preferred_day: string;
  preferred_time: string;
  created_at: string;
  updated_at: string;
  ready_at: string;
  collected_at: string;
  notified_ready_at: string;
  notified_unavailable_at: string;
}

export interface ReservationItem {
  id: string;
  reservation_id: string;
  product_id: string;
  item_name: string;
  quantity: number;
  item_status: string;
  staff_note: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  reservation_id: string;
  item_id: string;
  user_id: string;
  r2_key: string;
  kind: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface ReservationEvent {
  id: number;
  reservation_id: string;
  event: string;
  detail: string;
  actor: string;
  created_at: string;
}

// A reservation with its items + photo metadata, as returned to the UI.
export interface ReservationDetail extends Reservation {
  items: ReservationItem[];
  photos: Photo[];
  events?: ReservationEvent[];
}
