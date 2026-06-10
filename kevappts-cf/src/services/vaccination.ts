/**
 * Vaccinations — shared helpers for the Spinola vaccination booking flow.
 *
 * A vaccination is just a Spinola appointment (clinic='spinola') with extra
 * metadata describing which vaccine(s) the patient wants, or — for travellers
 * who don't yet know what they need — the destination country so the doctor
 * can advise. We deliberately keep the slot/booking machinery identical to a
 * normal Spinola consultation (service_id='clinic', same unique-slot index) so
 * one patient books one Spinola slot and a vaccination can never double-book
 * over a consultation. The vaccine details ride along in service_name +
 * comments so they show on the confirmation, the doctor email, the admin views
 * and the calendar without needing a new column.
 *
 * The canonical vaccine lists live here so the backend descriptor and any
 * future server-side validation share one source of truth. The booking page
 * renders its own copies of these lists in the wizard (it's a static HTML
 * template), so if you add a vaccine, add it in both places.
 */

/** Travel vaccines commonly offered at Spinola Clinic. */
export const TRAVEL_VACCINES = [
  'Hepatitis A',
  'Hepatitis B',
  'Japanese Encephalitis',
  'Rabies',
  'Yellow Fever',
  'Tick-borne Encephalitis',
  'Typhoid',
];

/** Routine vaccines commonly offered at Spinola Clinic. */
export const ROUTINE_VACCINES = [
  'Meningitis',
  'DTaP',
  'DTP',
  'HPV',
  'Pneumococcal',
  'MenACWY',
  'Rotavirus',
  'Shingles',
  'Varicella',
  'Influenza',
  'MMRV',
];

export interface VaccinationInfo {
  /** 'travel' | 'routine' */
  category?: string;
  /** 'vaccine' (patient picked specific vaccines) | 'destination' (doctor advises) */
  mode?: string;
  /** Selected vaccine names. */
  vaccines?: string[];
  /** Single vaccine (back-compat / convenience). */
  vaccine?: string;
  /** Destination country (travel + "let the doctor advise"). */
  destination?: string;
  /** Optional departure / travel date (free text). */
  travelDate?: string;
}

export interface VaccinationDescriptor {
  /** Headline shown in tables, the calendar title and the email body. */
  serviceName: string;
  /** Multi-line detail block stored in comments and shown in the email. */
  summary: string;
  isTravel: boolean;
}

/** Strip control chars / angle brackets, collapse whitespace, clip length. */
function clean(value: unknown, max = 80): string {
  return String(value == null ? '' : value)
    .replace(/[\x00-\x1F\x7F<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/**
 * Turn the raw vaccination payload into a tidy headline + detail summary.
 * Returns null when there's nothing usable so callers fall back to a plain
 * Spinola consultation. Lenient by design — the UI does the real validation;
 * here we only need safe, presentable text.
 */
export function buildVaccinationDescriptor(raw: VaccinationInfo | null | undefined): VaccinationDescriptor | null {
  if (!raw || typeof raw !== 'object') return null;

  const isTravel = clean(raw.category, 16).toLowerCase() === 'travel';

  let vaccines: string[] = [];
  if (Array.isArray(raw.vaccines)) vaccines = raw.vaccines.map((v) => clean(v, 40)).filter(Boolean);
  else if (raw.vaccine) vaccines = [clean(raw.vaccine, 40)];
  vaccines = vaccines.slice(0, 12);

  const destination = clean(raw.destination, 60);
  const travelDate = clean(raw.travelDate, 40);

  const explicitMode = clean(raw.mode, 16).toLowerCase();
  const mode =
    explicitMode === 'destination' ? 'destination'
    : explicitMode === 'vaccine' ? 'vaccine'
    : (isTravel && destination && !vaccines.length) ? 'destination'
    : 'vaccine';

  // Nothing usable at all — let the caller treat it as a normal consultation.
  if (!isTravel && !vaccines.length) return null;
  if (isTravel && mode === 'vaccine' && !vaccines.length && !destination) return null;

  let serviceName: string;
  const lines: string[] = [];

  if (isTravel && mode === 'destination') {
    serviceName = 'Travel Vaccines — ' + (destination || 'destination to confirm');
    lines.push('Travel vaccination consultation');
    lines.push('Destination: ' + (destination || '(not specified)'));
    lines.push('The doctor will advise which vaccines are needed for this destination.');
  } else if (isTravel) {
    const list = vaccines.length ? vaccines.join(', ') : 'vaccines to confirm';
    serviceName = 'Travel Vaccination — ' + list;
    lines.push('Travel vaccination');
    lines.push('Requested: ' + list);
    if (destination) lines.push('Destination: ' + destination);
  } else {
    const list = vaccines.join(', ');
    serviceName = 'Vaccination — ' + list;
    lines.push('Routine vaccination');
    lines.push('Requested: ' + list);
  }

  if (travelDate) lines.push('Travel date: ' + travelDate);

  // Keep service_name compact so admin tables and calendar titles stay tidy.
  if (serviceName.length > 90) serviceName = serviceName.slice(0, 89) + '…';

  return { serviceName, summary: lines.join('\n'), isTravel };
}
