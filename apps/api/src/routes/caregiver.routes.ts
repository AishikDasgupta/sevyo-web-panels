import { Router } from 'express';
import {
  createForVendor,
  getOne,
  list,
  me,
  updateOne,
} from '../controllers/caregiver.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';

const router = Router();

router.get('/', requireAuth, list);
router.get('/me', requireAuth, requireRole('resource'), me);
router.get('/:id', requireAuth, getOne);
router.post('/', requireAuth, requireRole('vendor'), createForVendor);
router.patch('/:id', requireAuth, updateOne);

export default router;