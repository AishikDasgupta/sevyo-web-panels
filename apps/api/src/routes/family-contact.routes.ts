import { Router } from 'express';
import { addContact, deleteContact, listContacts } from '../controllers/user.controller';
import { requireAuth } from '../middleware/require-auth';
import { familyContactSchema } from '../schemas/family-contact.schema';
import { validateBody } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

// SOS contacts — used by the in-app emergency dialer
router.get('/', requireAuth, asyncHandler(listContacts));
router.post('/', requireAuth, validateBody(familyContactSchema), asyncHandler(addContact));
router.delete('/:id', requireAuth, asyncHandler(deleteContact));

export default router;