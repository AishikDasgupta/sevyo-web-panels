import { Router } from 'express';
import { create, list } from '../controllers/review.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createReviewSchema, listReviewsQuery } from '../schemas/review.schema';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/', requireAuth, validateQuery(listReviewsQuery), asyncHandler(list));
router.post('/', requireAuth, requireRole('user'), validateBody(createReviewSchema), asyncHandler(create));

export default router;