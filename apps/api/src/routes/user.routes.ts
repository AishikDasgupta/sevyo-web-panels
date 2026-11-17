import { Router } from 'express';
import {
  getMe,
  updateMe,
  changePassword,
} from '../controllers/user.controller';
import { requireAuth } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../schemas/user.schema';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, validateBody(updateProfileSchema), updateMe);
router.post('/me/password', requireAuth, validateBody(changePasswordSchema), changePassword);

export default router;