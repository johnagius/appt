/**
 * Smoke test for the telemedicine flow against an in-memory D1.
 * Verifies the queries layer end-to-end without spinning up the worker.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  insertTelemedicineCall, getTelemedicineCallsByDate, getTelemedicineCallById,
  deleteTelemedicineCall, updateTelemedicineCallStatus, updateTelemedicineMedicine,
  updateTelemedicineMedicines, markTelemedicinePrescriptionSent,
  getTelemedicineStats,
  type TelemedicineCall,
} from '../src/db/queries';

// Tiny in-memory D1-shaped stub. Just enough to satisfy the prepared
// statement methods used by the queries above.
class FakeDB {
  rows: any[] = [];
  // Track simple pseudo-table for ALTER TABLE handling — we just no-op,
  // which is fine for these tests since we control the schema.
  prepare(sql: string) {
    const self = this;
    return {
      _sql: sql,
      _binds: [] as any[],
      bind(...args: any[]) { this._binds = args; return this; },
      async run() {
        const sqlLow = self._normalize(this._sql);
        if (sqlLow.startsWith('insert into telemedicine_calls')) {
          // Map binds into the row by column order from the SQL.
          const row: any = {};
          const cols = self._extractCols(this._sql);
          for (let i = 0; i < cols.length; i++) row[cols[i]] = this._binds[i];
          self.rows.push(row);
          return { meta: { changes: 1 } };
        }
        if (sqlLow.startsWith('update telemedicine_calls')) {
          const id = this._binds[this._binds.length - 1];
          const row = self.rows.find(r => r.id === id);
          if (!row) return { meta: { changes: 0 } };
          // Parse SET clause to update fields.
          const setMatch = this._sql.match(/SET ([^]+?)WHERE/i);
          if (setMatch) {
            const sets = setMatch[1].split(',').map(s => s.trim());
            for (let i = 0; i < sets.length; i++) {
              const col = sets[i].split('=')[0].trim();
              row[col] = this._binds[i];
            }
          }
          return { meta: { changes: 1 } };
        }
        if (sqlLow.startsWith('delete from telemedicine_calls')) {
          const before = self.rows.length;
          self.rows = self.rows.filter(r => r.id !== this._binds[0]);
          return { meta: { changes: before - self.rows.length } };
        }
        if (sqlLow.startsWith('create table') || sqlLow.startsWith('alter table')) {
          return { meta: { changes: 0 } };
        }
        return { meta: { changes: 0 } };
      },
      async first() {
        const sqlLow = self._normalize(this._sql);
        if (sqlLow.includes('from telemedicine_calls') && sqlLow.includes('where id =')) {
          return self.rows.find(r => r.id === this._binds[0]) || null;
        }
        if (sqlLow.includes('count(*)')) {
          return self._aggregate(this._sql, this._binds);
        }
        return null;
      },
      async all() {
        const sqlLow = self._normalize(this._sql);
        if (sqlLow.includes('from telemedicine_calls') && sqlLow.includes('where date_key =')) {
          const dk = this._binds[0];
          return { results: self.rows.filter(r => r.date_key === dk).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')) };
        }
        return { results: [] };
      },
    };
  }

  _normalize(sql: string): string {
    return sql.toLowerCase().replace(/\s+/g, ' ').trim();
  }
  _extractCols(sql: string): string[] {
    const m = sql.match(/INSERT INTO telemedicine_calls \(([^)]+)\)/i);
    if (!m) return [];
    return m[1].split(',').map(s => s.trim());
  }
  _aggregate(sql: string, binds: any[]): { c: number; r: number; m: number } {
    let pool = this.rows.filter(r => r.status !== 'CANCELLED');
    if (sql.includes('date_key = ?')) {
      pool = pool.filter(r => r.date_key === binds[0]);
    } else if (sql.includes('date_key >= ?')) {
      pool = pool.filter(r => r.date_key >= binds[0]);
    }
    return {
      c: pool.length,
      r: pool.reduce((s, r) => s + (r.fee_cents || 0), 0),
      m: pool.reduce((s, r) => s + (r.medicine_cents || 0), 0),
    };
  }
}

const db = new FakeDB() as unknown as D1Database;
function fresh() { (db as any).rows = []; }

function mkCall(over: Partial<TelemedicineCall> = {}): TelemedicineCall {
  const base: TelemedicineCall = {
    id: 'T-' + Math.random().toString(36).slice(2),
    date_key: '2026-05-06',
    patient_name: 'Jane Patient',
    phone: '+356 1234 5678',
    email: 'jane@example.com',
    comments: '',
    fee_cents: 2500,
    medicine_cents: 0,
    medicines: '',
    prescription_sent_at: '',
    status: 'BOOKED',
    source: 'public',
    created_at: '2026-05-06 21:00:00',
    updated_at: '2026-05-06 21:00:00',
  };
  return { ...base, ...over };
}

describe('telemedicine D1 queries', () => {
  beforeEach(() => fresh());

  it('insert + list by date', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-a' }));
    await insertTelemedicineCall(db, mkCall({ id: 'T-b', created_at: '2026-05-06 21:30:00' }));
    await insertTelemedicineCall(db, mkCall({ id: 'T-c', date_key: '2026-05-07' }));
    const day = await getTelemedicineCallsByDate(db, '2026-05-06');
    expect(day.map(c => c.id)).toEqual(['T-a', 'T-b']);
  });

  it('updateTelemedicineMedicine sets medicine_cents only (doctor fee untouched)', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-x' }));
    await updateTelemedicineMedicine(db, 'T-x', 1750, '2026-05-06 21:30:00');
    const row = await getTelemedicineCallById(db, 'T-x');
    expect(row?.medicine_cents).toBe(1750);
    expect(row?.fee_cents).toBe(2500);
  });

  it('updateTelemedicineMedicines stores the prescription text', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-m' }));
    await updateTelemedicineMedicines(db, 'T-m', 'Paracetamol\nIbuprofen', '2026-05-06 21:35:00');
    const row = await getTelemedicineCallById(db, 'T-m');
    expect(row?.medicines).toBe('Paracetamol\nIbuprofen');
  });

  it('markTelemedicinePrescriptionSent records the timestamp', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-p' }));
    await markTelemedicinePrescriptionSent(db, 'T-p', '2026-05-06 21:45:00');
    const row = await getTelemedicineCallById(db, 'T-p');
    expect(row?.prescription_sent_at).toBe('2026-05-06 21:45:00');
  });

  it('updateTelemedicineCallStatus toggles to COMPLETED / CANCELLED / BOOKED', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-s' }));
    await updateTelemedicineCallStatus(db, 'T-s', 'COMPLETED', '2026-05-06 21:50:00');
    expect((await getTelemedicineCallById(db, 'T-s'))?.status).toBe('COMPLETED');
    await updateTelemedicineCallStatus(db, 'T-s', 'CANCELLED', '2026-05-06 21:51:00');
    expect((await getTelemedicineCallById(db, 'T-s'))?.status).toBe('CANCELLED');
  });

  it('deleteTelemedicineCall removes the row', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-d' }));
    await deleteTelemedicineCall(db, 'T-d');
    expect(await getTelemedicineCallById(db, 'T-d')).toBeNull();
  });

  it('stats: doctor revenue counts €25 only, medicine billed separate, cancelled excluded', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-1', medicine_cents: 1000 }));
    await insertTelemedicineCall(db, mkCall({ id: 'T-2', medicine_cents: 5000 }));
    await insertTelemedicineCall(db, mkCall({ id: 'T-3', medicine_cents: 99999, status: 'CANCELLED' }));
    const stats = await getTelemedicineStats(db, '2026-05-06', '2026-05-04');
    expect(stats.todayCalls).toBe(2);
    expect(stats.todayRevenueCents).toBe(5000); // 2 × €25
    expect(stats.todayMedicineCents).toBe(6000); // €60 medicine billed
    expect(stats.totalRevenueCents).toBe(5000);
  });

  it('emails-only flow: patient with no email still saves and tallies', async () => {
    await insertTelemedicineCall(db, mkCall({ id: 'T-noem', email: '', source: 'admin' }));
    const list = await getTelemedicineCallsByDate(db, '2026-05-06');
    expect(list[0].email).toBe('');
    expect(list[0].source).toBe('admin');
    // Doctor fee still €25 — medicine bill helper still works.
    await updateTelemedicineMedicine(db, 'T-noem', 750, '2026-05-06 21:55:00');
    const after = await getTelemedicineCallById(db, 'T-noem');
    expect(after?.medicine_cents).toBe(750);
    expect(after?.fee_cents).toBe(2500);
  });
});
