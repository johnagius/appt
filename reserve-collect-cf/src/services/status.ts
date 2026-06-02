/** Pure helpers mapping per-item availability onto the order-level status.
 *  Kept dependency-free so it can be unit-tested without a DB. */
import type { ItemStatus, ReservationStatus } from '../types';

export interface ItemLike { item_status: string; }

/** Derive the order status from the review outcome of its items.
 *  Only used while an order is in the review phase — callers must not
 *  apply this over terminal states (READY_FOR_COLLECTION / COLLECTED / CANCELLED). */
export function deriveOrderStatus(items: ItemLike[]): ReservationStatus {
  if (items.length === 0) return 'SUBMITTED';
  const statuses = items.map(i => i.item_status as ItemStatus);
  const pending = statuses.filter(s => s === 'PENDING').length;
  const available = statuses.filter(s => s === 'AVAILABLE').length;

  // Still being reviewed by staff.
  if (pending > 0) return 'SUBMITTED';
  // Everything confirmed in stock.
  if (available === statuses.length) return 'ACCEPTED';
  // Some (or none) can be supplied — single codepath for the customer email.
  return 'PARTIALLY_UNAVAILABLE';
}

/** True if at least one item can actually be collected. */
export function hasCollectable(items: ItemLike[]): boolean {
  return items.some(i => i.item_status === 'AVAILABLE');
}

export const ITEM_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Being checked',
  AVAILABLE: 'Available',
  RESERVED_ALREADY: 'Reserved already',
  UNAVAILABLE: 'Unavailable',
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Submitted',
  ACCEPTED: 'Accepted',
  READY_FOR_COLLECTION: 'Ready for collection',
  COLLECTED: 'Collected',
  PARTIALLY_UNAVAILABLE: 'Partially available',
  CANCELLED: 'Cancelled',
};

export const VALID_ITEM_STATUSES: ItemStatus[] = ['PENDING', 'AVAILABLE', 'RESERVED_ALREADY', 'UNAVAILABLE'];
