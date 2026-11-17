import { Router } from 'express';
import { addContact, deleteContact, listContacts } from '../controllers/user.controller';
import { requireAuth } from '../middleware/require-auth';
import { familyContactSchema } from '../schemas/family-contact.schema';
import { validateBody } from '../middleware/validate';

const router = Router();

// SOS contacts — used by the in-app emergency dialer
router.get('/', requireAuth, listContacts);
router.post('/', requireAuth, validateBody(familyContactSchema), addContact);
router.delete('/:id', requireAuth, deleteContact);

export default router;