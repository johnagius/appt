/** End-to-end reservation flow against the in-memory FakeDB:
 *  create → add items → staff mark statuses → ready → collected. */
import { describe, it, expect, beforeEach } from 'vitest';
import { FakeDB } from './fakedb';
import {
  insertReservation, getReservationById, insertReservationItem, getItemsByReservation,
  getItemById, updateItemStatus, markReservationReady, markReservationCollected,
  updateReservationStatus,
} from '../src/db/queries';
import { deriveOrderStatus, hasCollectable } from '../src/services/status';
import type { Reservation, ReservationItem } from '../src/types';

const db = new FakeDB() as unknown as D1Database;
beforeEach(() => { (db as any).tables = {}; });

function mkResv(over: Partial<Reservation> = {}): Reservation {
  return {
    id: 'R-1', reference: 'PC-TEST', user_id: 'U-1',
    customer_name: 'Jane', customer_email: 'jane@example.com', customer_phone: '',
    status: 'SUBMITTED', notes: '', staff_note: '', preferred_day: '', preferred_time: '',
    created_at: '2026-06-02 10:00:00', updated_at: '2026-06-02 10:00:00',
    ready_at: '', collected_at: '', notified_ready_at: '', notified_unavailable_at: '',
    ...over,
  };
}
function mkItem(over: Partial<ReservationItem> = {}): ReservationItem {
  return {
    id: 'RI-' + Math.random().toString(36).slice(2), reservation_id: 'R-1', product_id: '',
    item_name: 'Paracetamol', quantity: 1, item_status: 'PENDING', staff_note: '',
    created_at: '2026-06-02 10:00:0' + Math.floor(Math.random() * 9), updated_at: '2026-06-02 10:00:00',
    ...over,
  };
}

describe('reservation flow', () => {
  it('creates a reservation and reads it back', async () => {
    await insertReservation(db, mkResv());
    const r = await getReservationById(db, 'R-1');
    expect(r?.reference).toBe('PC-TEST');
    expect(r?.status).toBe('SUBMITTED');
  });

  it('adds line items and lists them', async () => {
    await insertReservation(db, mkResv());
    await insertReservationItem(db, mkItem({ id: 'RI-a', item_name: 'Aspirin', created_at: '2026-06-02 10:00:01' }));
    await insertReservationItem(db, mkItem({ id: 'RI-b', item_name: 'Vitamin C', created_at: '2026-06-02 10:00:02' }));
    const items = await getItemsByReservation(db, 'R-1');
    expect(items.map(i => i.item_name)).toEqual(['Aspirin', 'Vitamin C']);
  });

  it('all items available → ACCEPTED', async () => {
    await insertReservation(db, mkResv());
    await insertReservationItem(db, mkItem({ id: 'RI-a' }));
    await insertReservationItem(db, mkItem({ id: 'RI-b' }));
    await updateItemStatus(db, 'RI-a', 'AVAILABLE', '', '2026-06-02 11:00:00');
    await updateItemStatus(db, 'RI-b', 'AVAILABLE', 'in stock', '2026-06-02 11:00:00');
    const items = await getItemsByReservation(db, 'R-1');
    expect(deriveOrderStatus(items)).toBe('ACCEPTED');
    expect((await getItemById(db, 'RI-b'))?.staff_note).toBe('in stock');
  });

  it('mixed availability → PARTIALLY_UNAVAILABLE but still collectable', async () => {
    await insertReservation(db, mkResv());
    await insertReservationItem(db, mkItem({ id: 'RI-a' }));
    await insertReservationItem(db, mkItem({ id: 'RI-b' }));
    await updateItemStatus(db, 'RI-a', 'AVAILABLE', '', '2026-06-02 11:00:00');
    await updateItemStatus(db, 'RI-b', 'UNAVAILABLE', 'out of stock', '2026-06-02 11:00:00');
    const items = await getItemsByReservation(db, 'R-1');
    expect(deriveOrderStatus(items)).toBe('PARTIALLY_UNAVAILABLE');
    expect(hasCollectable(items)).toBe(true);
  });

  it('mark ready then collected sets the timestamps and statuses', async () => {
    await insertReservation(db, mkResv({ status: 'ACCEPTED' }));
    await markReservationReady(db, 'R-1', '2026-06-02 12:00:00');
    let r = await getReservationById(db, 'R-1');
    expect(r?.status).toBe('READY_FOR_COLLECTION');
    expect(r?.ready_at).toBe('2026-06-02 12:00:00');
    await markReservationCollected(db, 'R-1', '2026-06-02 13:00:00');
    r = await getReservationById(db, 'R-1');
    expect(r?.status).toBe('COLLECTED');
    expect(r?.collected_at).toBe('2026-06-02 13:00:00');
  });

  it('customer cancel sets CANCELLED', async () => {
    await insertReservation(db, mkResv());
    await updateReservationStatus(db, 'R-1', 'CANCELLED', '2026-06-02 12:30:00');
    expect((await getReservationById(db, 'R-1'))?.status).toBe('CANCELLED');
  });
});
