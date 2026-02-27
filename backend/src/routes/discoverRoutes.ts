// src/routes/discoverRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { discoverByInterests, filterProfiles } from '../controllers/discoverController';

const router = Router();

router.use(protect);

// POST /api/discover/filter
router.post('/filter', filterProfiles);
// GET /api/discover/interests?interests=Music,Prayer
router.get('/interests', discoverByInterests);

export default router;
