import { Router } from 'express';
import { list } from '../controllers/service.controller';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

// Public: landing page + portal home screens fetch instant services pre-auth
router.get('/', asyncHandler(list));

export default router;