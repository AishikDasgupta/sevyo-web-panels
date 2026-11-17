import { Router } from 'express';
import { list } from '../controllers/service.controller';

const router = Router();

// Public: landing page + portal home screens fetch instant services pre-auth
router.get('/', list);

export default router;