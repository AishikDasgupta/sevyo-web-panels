import { Router } from 'express';
import {
  setVendorStatus,
  setUserStatus,
  stats,
  users,
  vendors,
} from '../controllers/admin.controller';
import { requireRole } from '../middleware/require-auth';
import { z } from 'zod';
import { USER_STATUSES, VENDOR_STATUSES } from '@sevyo/shared-types';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireRole('admin'));

const userStatusSchema = z.object({ status: z.enum(USER_STATUSES) });
const vendorStatusSchema = z.object({ status: z.enum(VENDOR_STATUSES) });

router.get('/stats', stats);
router.get('/users', users);
router.patch('/users/:id/status', validateBody(userStatusSchema), setUserStatus);
router.get('/vendors', vendors);
router.patch('/vendors/:id/status', validateBody(vendorStatusSchema), setVendorStatus);

export default router;