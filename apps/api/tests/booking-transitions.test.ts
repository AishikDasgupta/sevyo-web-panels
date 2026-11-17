import { describe, expect, it } from 'vitest';
import { BOOKING_STATUSES, type BookingStatus } from '@sevyo/shared-types';
import { DEFAULT_INSTANT_PRICE, TRANSITIONS } from '../src/services/booking.service';

describe('booking state machine', () => {
  it('allows the documented happy path', () => {
    expect(TRANSITIONS.pending).toContain('broadcast');
    expect(TRANSITIONS.pending).toContain('confirmed');
    expect(TRANSITIONS.broadcast).toContain('confirmed');
    expect(TRANSITIONS.confirmed).toContain('in_progress');
    expect(TRANSITIONS.in_progress).toContain('completed');
  });

  it('allows cancellation from every active state', () => {
    for (const active of ['pending', 'broadcast', 'confirmed', 'in_progress'] as BookingStatus[]) {
      expect(TRANSITIONS[active]).toContain('cancelled');
    }
  });

  it('terminal states have no exits', () => {
    for (const terminal of ['completed', 'cancelled', 'expired'] as BookingStatus[]) {
      expect(TRANSITIONS[terminal]).toEqual([]);
    }
  });

  it('never references an unknown status', () => {
    const known = new Set<string>(BOOKING_STATUSES);
    for (const status of BOOKING_STATUSES) {
      for (const next of TRANSITIONS[status]) {
        expect(known.has(next)).toBe(true);
      }
    }
  });

  it('instant broadcast bookings use the flat default price', () => {
    expect(DEFAULT_INSTANT_PRICE).toBe(500);
  });
});
