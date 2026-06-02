import { describe, it, expect } from 'vitest';
import { deriveOrderStatus, hasCollectable } from '../src/services/status';

const items = (...st: string[]) => st.map(s => ({ item_status: s }));

describe('deriveOrderStatus', () => {
  it('no items → SUBMITTED', () => {
    expect(deriveOrderStatus([])).toBe('SUBMITTED');
  });
  it('all pending → SUBMITTED', () => {
    expect(deriveOrderStatus(items('PENDING', 'PENDING'))).toBe('SUBMITTED');
  });
  it('still reviewing (some pending) → SUBMITTED', () => {
    expect(deriveOrderStatus(items('AVAILABLE', 'PENDING'))).toBe('SUBMITTED');
  });
  it('all available → ACCEPTED', () => {
    expect(deriveOrderStatus(items('AVAILABLE', 'AVAILABLE'))).toBe('ACCEPTED');
  });
  it('available + unavailable → PARTIALLY_UNAVAILABLE', () => {
    expect(deriveOrderStatus(items('AVAILABLE', 'UNAVAILABLE'))).toBe('PARTIALLY_UNAVAILABLE');
  });
  it('all unavailable/reserved → PARTIALLY_UNAVAILABLE', () => {
    expect(deriveOrderStatus(items('UNAVAILABLE', 'RESERVED_ALREADY'))).toBe('PARTIALLY_UNAVAILABLE');
  });
});

describe('hasCollectable', () => {
  it('true when any item is available', () => {
    expect(hasCollectable(items('UNAVAILABLE', 'AVAILABLE'))).toBe(true);
  });
  it('false when nothing is available', () => {
    expect(hasCollectable(items('UNAVAILABLE', 'RESERVED_ALREADY'))).toBe(false);
  });
});
