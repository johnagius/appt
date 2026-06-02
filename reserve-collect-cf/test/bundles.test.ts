import { describe, it, expect, beforeEach } from 'vitest';
import { FakeDB } from './fakedb';
import { pricing } from '../src/api/bundles';
import { addFavourite, listFavourites, deleteFavourite } from '../src/db/queries';

describe('bundle pricing', () => {
  it('sums items and applies the discount %', () => {
    const p = pricing([{ price_cents: 500 }, { price_cents: 300 }, { price_cents: 200 }], 10);
    expect(p.originalCents).toBe(1000);
    expect(p.finalCents).toBe(900);   // 10% off €10.00
    expect(p.saveCents).toBe(100);
  });
  it('0% discount = no change', () => {
    const p = pricing([{ price_cents: 1234 }], 0);
    expect(p.finalCents).toBe(1234);
    expect(p.saveCents).toBe(0);
  });
  it('rounds to the nearest cent and clamps the percent', () => {
    const p = pricing([{ price_cents: 999 }], 33);
    expect(p.finalCents).toBe(Math.round(999 * 0.67)); // 669
    const over = pricing([{ price_cents: 100 }], 150);
    expect(over.finalCents).toBe(0); // clamped to 100%
  });
});

describe('favourites CRUD', () => {
  const db = new FakeDB() as unknown as D1Database;
  beforeEach(() => { (db as any).tables = {}; });

  it('add, list (newest first), delete', async () => {
    await addFavourite(db, { userId: 'U-1', itemName: 'Paracetamol', quantity: 2, now: '2026-06-02 10:00:01' });
    await addFavourite(db, { userId: 'U-1', itemName: 'Vitamin D', quantity: 1, now: '2026-06-02 10:00:02' });
    await addFavourite(db, { userId: 'U-2', itemName: 'Other', quantity: 1, now: '2026-06-02 10:00:03' });

    const mine = await listFavourites(db, 'U-1');
    expect(mine.map(f => f.item_name)).toEqual(['Vitamin D', 'Paracetamol']); // DESC by created_at
    expect(mine.length).toBe(2);

    await deleteFavourite(db, mine[0].id, 'U-1');
    const after = await listFavourites(db, 'U-1');
    expect(after.map(f => f.item_name)).toEqual(['Paracetamol']);
  });
});
