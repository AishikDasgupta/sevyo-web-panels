import { Router } from 'express';
import {
  createForVendor,
  getOne,
  list,
  me,
  updateOne,
} from '../controllers/caregiver.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/', requireAuth, asyncHandler(list));
router.get('/me', requireAuth, requireRole('resource'), asyncHandler(me));
router.get('/:id', requireAuth, asyncHandler(getOne));
router.post('/', requireAuth, requireRole('vendor'), asyncHandler(createForVendor));
router.patch('/:id', requireAuth, asyncHandler(updateOne));

export default router;