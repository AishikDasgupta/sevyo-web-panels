import { Router } from 'express';
import { create, list, transition } from '../controllers/booking.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  bookingTransitionSchema,
  createBookingSchema,
  listBookingsQuery,
} from '../schemas/booking.schema';

const router = Router();

router.get('/', requireAuth, validateQuery(listBookingsQuery), list);
router.post('/', requireAuth, requireRole('user'), validateBody(createBookingSchema), create);
router.patch(
  '/:id/status',
  requireAuth,
  validateBody(bookingTransitionSchema),
  transition,
);

export default router;