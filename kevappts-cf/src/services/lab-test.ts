/**
 * Lab tests — shared descriptor for the Blood / STI / Urinalysis booking wizard.
 *
 * All three categories reuse the existing blood-test slot machinery
 * (service_id='blood-test', its own staff-run schedule independent of the
 * doctors — see services/blood-test.ts). Only the LOCATION (Spinola vs
 * Potter's) is admin-toggleable via the BLOOD_TEST_LOCATION config key. The
 * specific tests the patient picked ride in service_name + comments, exactly
 * like vaccinations, so they show on the confirmation, the admin views and the
 * calendar without any new column.
 *
 * This module only formats the structured selection into presentable text; the
 * wizard (in pages/index-page.ts) owns the catalogue of tests it renders. Keep
 * it lenient — the UI does the real validation.
 */

export interface LabTestInfo {
  /** 'blood' | 'sti' | 'urinalysis' */
  category?: string;
  /** Individually selected test names. */
  tests?: string[];
  /** Optional add-on test names. */
  addons?: string[];
  /** Set when the patient chose a bundled package (e.g. "Full STI Check"). */
  packageName?: string;
}

export interface LabTestDescriptor {
  /** Headline shown in tables, the calendar title and the email body. */
  serviceName: string;
  /** Multi-line detail block stored in comments and shown in the email. */
  summary: string;
  /** Normalised category: 'blood' | 'sti' | 'urinalysis'. */
  category: 'blood' | 'sti' | 'urinalysis';
}

/** Strip control chars / angle brackets, collapse whitespace, clip length. */
function clean(value: unknown, max = 60): string {
  return String(value == null ? '' : value)
    .replace(/[\x00-\x1F\x7F<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanList(raw: unknown, max = 16): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((v) => clean(v, 60)).filter(Boolean).slice(0, max);
}

const CATEGORY_LABEL: Record<string, string> = {
  blood: 'Blood Test',
  sti: 'STI Test',
  urinalysis: 'Urinalysis',
};

/**
 * Build a tidy headline + detail summary from the wizard's selection.
 * Returns null when there's nothing usable so callers fall back to a plain
 * "Blood Test".
 */
export function buildLabTestDescriptor(raw: LabTestInfo | null | undefined): LabTestDescriptor | null {
  if (!raw || typeof raw !== 'object') return null;

  const catRaw = clean(raw.category, 16).toLowerCase();
  const category: 'blood' | 'sti' | 'urinalysis' =
    catRaw === 'sti' ? 'sti' : catRaw === 'urinalysis' ? 'urinalysis' : 'blood';

  const tests = cleanList(raw.tests);
  const addons = cleanList(raw.addons);
  const packageName = clean(raw.packageName, 60);

  // Nothing meaningful selected.
  if (!packageName && !tests.length && category !== 'urinalysis') return null;

  let serviceName: string;
  const lines: string[] = [];

  if (packageName) {
    serviceName = packageName; // e.g. "Full STI Check"
    lines.push(packageName + ' (Blood + Urine/Swab)');
  } else if (category === 'urinalysis') {
    serviceName = 'Urinalysis' + (addons.length ? ' (+ add-ons)' : '');
    lines.push('Urinalysis (urine test)');
  } else {
    const list = tests.join(', ');
    serviceName = CATEGORY_LABEL[category] + ' — ' + list;
    lines.push(CATEGORY_LABEL[category] + 's requested:');
    lines.push(list);
  }

  if (packageName && tests.length) {
    lines.push('Selected: ' + tests.join(', '));
  }
  if (addons.length) {
    lines.push('Add-ons: ' + addons.join(', '));
  }

  // Keep service_name compact so admin tables and calendar titles stay tidy.
  if (serviceName.length > 90) serviceName = serviceName.slice(0, 89) + '…';

  return { serviceName, summary: lines.join('\n'), category };
}
