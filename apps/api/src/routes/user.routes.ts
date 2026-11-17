import { Router } from 'express';
import {
  getMe,
  updateMe,
  changePassword,
} from '../controllers/user.controller';
import { requireAuth } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../schemas/user.schema';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/me', requireAuth, asyncHandler(getMe));
router.patch('/me', requireAuth, validateBody(updateProfileSchema), asyncHandler(updateMe));
router.post('/me/password', requireAuth, validateBody(changePasswordSchema), asyncHandler(changePassword));

export default router;