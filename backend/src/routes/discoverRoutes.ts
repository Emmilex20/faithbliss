// src/routes/discoverRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { filterProfiles } from '../controllers/discoverController';

const router = Router();

router.use(protect);

// POST /api/discover/filter
router.post('/filter', filterProfiles);

export default router;
