import { Router } from 'express';
import { list, markAllRead, markRead } from '../controllers/notification.controller';
import { asyncHandler } from '../lib/async-handler';
import { requireAuth } from '../middleware/require-auth';

const router = Router();

router.get('/', requireAuth, asyncHandler(list));
router.post('/read-all', requireAuth, asyncHandler(markAllRead));
router.post('/:id/read', requireAuth, asyncHandler(markRead));

export default router;
