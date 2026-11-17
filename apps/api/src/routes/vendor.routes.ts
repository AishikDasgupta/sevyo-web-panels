import { Router } from 'express';
import { createMine, myVendor, updateOne } from '../controllers/vendor.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate';
import { upsertVendorSchema } from '../schemas/vendor.schema';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.use(requireAuth, requireRole('vendor'));
router.get('/me', asyncHandler(myVendor));
router.post('/', validateBody(upsertVendorSchema), asyncHandler(createMine));
router.patch('/:id', validateBody(upsertVendorSchema.partial()), asyncHandler(updateOne));

export default router;
