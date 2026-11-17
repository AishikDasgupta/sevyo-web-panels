import { Router } from 'express';
import { createMine, myVendor, updateOne } from '../controllers/vendor.controller';
import { requireAuth, requireRole } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate';
import { upsertVendorSchema } from '../schemas/vendor.schema';

const router = Router();

router.use(requireRole('vendor'));
router.get('/me', myVendor);
router.post('/', requireAuth, requireRole('vendor'), validateBody(upsertVendorSchema), createMine);
router.patch('/:id', validateBody(upsertVendorSchema.partial()), updateOne);

export default router;
