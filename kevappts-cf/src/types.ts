export interface Env {
  DB: D1Database;
  REALTIME: DurableObjectNamespace;
  SIGNING_SECRET: string;
  ADMIN_SECRET: string;
  ADMIN_PASSWORD: string;
  RESEND_API_KEY: string;
  DOCTOR_EMAIL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN: string;
  GOOGLE_CALENDAR_ID: string;
  GOOGLE_SPINOLA_CALENDAR_ID: string;
  TIMEZONE: string;
  DOCTOR_NAME: string;
  CLINIC_NAME: string;
  SPINOLA_LOCATION: string;
  SPINOLA_DOCTOR_NAME: string;
  SPINOLA_LOCATION_DETAILS: string;
}

export interface Appointment {
  id: string;
  date_key: string;
  start_time: string;
  end_time: string;
  service_id: string;
  service_name: string;
  full_name: string;
  email: string;
  phone: string;
  comments: string;
  status: string;
  location: string;
  clinic: string;
  created_at: string;
  updated_at: string;
  token: string;
  calendar_event_id: string;
  cancelled_at: string;
  cancel_reason: string;
}

export type AppointmentStatus =
  | 'BOOKED'
  | 'CANCELLED_CLIENT'
  | 'CANCELLED_DOCTOR'
  | 'RELOCATED_SPINOLA'
  | 'ATTENDED'
  | 'NO_SHOW';

export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorOff {
  id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface DoctorExtra {
  id: number;
  date_key: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface TimeWindow {
  start: string;
  end: string;
}

export interface Slot {
  start: string;
  end: string;
  available?: boolean;
}

export interface WorkingHours {
  MON: TimeWindow[];
  TUE: TimeWindow[];
  WED: TimeWindow[];
  THU: TimeWindow[];
  FRI: TimeWindow[];
  SAT: TimeWindow[];
  SUN: TimeWindow[];
  [key: string]: TimeWindow[];
}

export interface Service {
  id: string;
  name: string;
  minutes: number;
}

export interface DoctorOffEntry {
  allDay: boolean;
  reason: string;
  blocks: { startMin: number; endMin: number; reason: string }[];
}

export interface DoctorOffMap {
  [dateKey: string]: DoctorOffEntry;
}

export interface DateOption {
  dateKey: string;
  label: string;
  disabled: boolean;
  reason: string;
  spinolaOnly: boolean;
}

export interface BookingPayload {
  serviceId: string;
  dateKey: string;
  startTime: string;
  fullName: string;
  email: string;
  phone: string;
  comments?: string;
}

export interface AppConfig {
  apptDurationMin: number;
  advanceDays: number;
  maxActiveApptsPerPerson: number;
  workingHours: WorkingHours;
  spinolaHours: WorkingHours;
  pottersLocation: string;
  spinolaLocation: string;
}
