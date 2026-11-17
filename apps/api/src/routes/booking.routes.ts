import { Router } from 'express';
import { create, list, transition } from '../controllers/booking.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  bookingTransitionSchema,
  createBookingSchema,
  listBookingsQuery,
} from '../schemas/booking.schema';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/', requireAuth, validateQuery(listBookingsQuery), asyncHandler(list));
router.post('/', requireAuth, requireRole('user'), validateBody(createBookingSchema), asyncHandler(create));
router.patch(
  '/:id/status',
  requireAuth,
  validateBody(bookingTransitionSchema),
  asyncHandler(transition),
);

export default router;