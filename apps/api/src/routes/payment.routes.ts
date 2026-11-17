import { Router } from 'express';
import { createOrder, verify } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate';
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from '../schemas/payment.schema';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.post('/razorpay/order', requireAuth, validateBody(createRazorpayOrderSchema), asyncHandler(createOrder));
router.post('/razorpay/verify', requireAuth, validateBody(verifyRazorpayPaymentSchema), asyncHandler(verify));

export default router;
