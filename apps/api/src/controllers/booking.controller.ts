import type { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import type { BookingStatus } from '@sevyo/shared-types';
import { BOOKING_STATUSES } from '@sevyo/shared-types';

export async function create(req: Request, res: Response) {
  res.status(201).json(await bookingService.create(req.user!.id, req.body));
}

export async function list(req: Request, res: Response) {
  const status = req.query.status as BookingStatus | undefined;
  const valid = status && (BOOKING_STATUSES as readonly string[]).includes(status);
  res.json(await bookingService.listFor(req.user!, valid ? status : undefined));
}

export async function transition(req: Request, res: Response) {
  const { status, caregiverId } = req.body;
  const booking = await bookingService.transition(
    BigInt(req.params.id),
    status,
    req.user!,
    caregiverId,
  );
  res.json(booking);
}