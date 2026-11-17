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
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.use(requireRole('admin'));

const userStatusSchema = z.object({ status: z.enum(USER_STATUSES) });
const vendorStatusSchema = z.object({ status: z.enum(VENDOR_STATUSES) });

router.get('/stats', asyncHandler(stats));
router.get('/users', asyncHandler(users));
router.patch('/users/:id/status', validateBody(userStatusSchema), asyncHandler(setUserStatus));
router.get('/vendors', asyncHandler(vendors));
router.patch('/vendors/:id/status', validateBody(vendorStatusSchema), asyncHandler(setVendorStatus));

export default router;