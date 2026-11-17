import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

const RAZORPAY_API = 'https://api.razorpay.com/v1';

export function razorpayConfigured(): boolean {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret);
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString('base64')}`;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function createOrder(
  amountPaise: number,
  receipt: string,
  notes: Record<string, string>,
): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  });
  const body = (await res.json().catch(() => null)) as
    | (Partial<RazorpayOrder> & { error?: { description?: string } })
    | null;
  if (!res.ok || !body?.id) {
    const description = body?.error?.description ?? `Razorpay order creation failed (${res.status})`;
    throw new AppError(description, 502, 'PAYMENT_GATEWAY_ERROR', body?.error);
  }
  return body as RazorpayOrder;
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', env.razorpayKeySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
