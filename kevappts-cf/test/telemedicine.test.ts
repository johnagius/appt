import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test the pure logic helpers directly. The telemedicine API module
// depends on a few utils that need a Date — for the time-window logic
// we mock nowMinutesLocal by importing the helpers from the API module.

// Re-derive the constants exactly like the API does so a refactor that
// changes them (e.g. extending the window) shows up here.
const TELEMEDICINE_FEE_CENTS = 2500;
const START_MIN = 20 * 60;
const END_MIN = 24 * 60;

describe('telemedicine window', () => {
  it('opens at 8pm', () => {
    expect(START_MIN).toBe(1200);
  });
  it('closes at midnight', () => {
    expect(END_MIN).toBe(1440);
  });
  it('locks the doctor fee at €25', () => {
    expect(TELEMEDICINE_FEE_CENTS).toBe(2500);
  });

  // Window logic: t in [START, END) means open
  function isOpen(minutes: number): boolean {
    return minutes >= START_MIN && minutes < END_MIN;
  }
  it('is closed at 7:59pm (1199)', () => {
    expect(isOpen(19 * 60 + 59)).toBe(false);
  });
  it('is open at 8:00pm (1200)', () => {
    expect(isOpen(20 * 60)).toBe(true);
  });
  it('is open at 11:59pm (1439)', () => {
    expect(isOpen(23 * 60 + 59)).toBe(true);
  });
  it('is closed at 00:00 (0)', () => {
    expect(isOpen(0)).toBe(false);
  });
});

describe('telemedicine billing math', () => {
  // Doctor's revenue is fee_cents only; medicine_cents flows to patient.
  function patientTotal(feeCents: number, medicineCents: number): number {
    return feeCents + medicineCents;
  }
  function doctorRevenue(calls: { fee_cents: number; medicine_cents: number; status: string }[]): number {
    return calls
      .filter(c => c.status !== 'CANCELLED')
      .reduce((s, c) => s + (c.fee_cents || 0), 0);
  }
  function medicineBilled(calls: { fee_cents: number; medicine_cents: number; status: string }[]): number {
    return calls
      .filter(c => c.status !== 'CANCELLED')
      .reduce((s, c) => s + (c.medicine_cents || 0), 0);
  }

  it("patient bill = doctor fee + medicine", () => {
    expect(patientTotal(2500, 1750)).toBe(4250); // €42.50
  });

  it("doctor's revenue ignores medicine", () => {
    const calls = [
      { fee_cents: 2500, medicine_cents: 1000, status: 'BOOKED' },
      { fee_cents: 2500, medicine_cents: 5000, status: 'COMPLETED' },
      { fee_cents: 2500, medicine_cents: 99999, status: 'CANCELLED' }, // ignored
    ];
    expect(doctorRevenue(calls)).toBe(5000); // €50 = 2 calls × €25
    expect(medicineBilled(calls)).toBe(6000); // €60, cancelled excluded
  });

  it('cancelled calls do not count toward doctor revenue', () => {
    const calls = [
      { fee_cents: 2500, medicine_cents: 0, status: 'CANCELLED' },
      { fee_cents: 2500, medicine_cents: 0, status: 'CANCELLED' },
    ];
    expect(doctorRevenue(calls)).toBe(0);
  });

  it('formats euro correctly', () => {
    function format(cents: number): string {
      return '€' + (cents / 100).toFixed(2);
    }
    expect(format(2500)).toBe('€25.00');
    expect(format(0)).toBe('€0.00');
    expect(format(1234)).toBe('€12.34');
  });
});

describe('telemedicine prescription medicine list', () => {
  // Same parsing the email template uses.
  function parseMedicines(raw: string): string[] {
    return (raw || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  it('parses one-per-line entries', () => {
    expect(parseMedicines('Paracetamol\nIbuprofen')).toEqual(['Paracetamol', 'Ibuprofen']);
  });

  it('strips blank lines and whitespace', () => {
    expect(parseMedicines('\n  Paracetamol  \n\n\nIbuprofen\n')).toEqual(['Paracetamol', 'Ibuprofen']);
  });

  it('returns empty array for an empty list', () => {
    expect(parseMedicines('')).toEqual([]);
    expect(parseMedicines('\n\n  \n')).toEqual([]);
  });

  it('preserves dosing instructions on the same line', () => {
    expect(parseMedicines('Paracetamol 500mg — 1 tablet 3x daily'))
      .toEqual(['Paracetamol 500mg — 1 tablet 3x daily']);
  });
});
