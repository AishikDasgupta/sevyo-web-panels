import { Router } from 'express';
import { createOrder, verify } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate';
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from '../schemas/payment.schema';

const router = Router();

router.post('/razorpay/order', requireAuth, validateBody(createRazorpayOrderSchema), createOrder);
router.post('/razorpay/verify', requireAuth, validateBody(verifyRazorpayPaymentSchema), verify);

export default router;
