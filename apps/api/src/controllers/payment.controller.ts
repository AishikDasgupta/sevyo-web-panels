import type { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';

export async function createOrder(req: Request, res: Response) {
  const order = await paymentService.createRazorpayOrder(req.body.bookingId, req.user!);
  res.status(201).json(order);
}

export async function verify(req: Request, res: Response) {
  const booking = await paymentService.verifyRazorpayPayment(req.body, req.user!);
  res.json(booking);
}
