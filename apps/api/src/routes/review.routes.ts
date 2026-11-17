import { Router } from 'express';
import { create, list } from '../controllers/review.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createReviewSchema, listReviewsQuery } from '../schemas/review.schema';

const router = Router();

router.get('/', requireAuth, validateQuery(listReviewsQuery), list);
router.post('/', requireAuth, requireRole('user'), validateBody(createReviewSchema), create);

export default router;