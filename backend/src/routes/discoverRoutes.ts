// src/routes/discoverRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  discoverByInterests,
  discoverByProfileFit,
  filterProfiles,
  getProfileFitCounts,
} from '../controllers/discoverController';

const router = Router();

router.use(protect);

// POST /api/discover/filter
router.post('/filter', filterProfiles);
// GET /api/discover/profile-fit-counts
router.get('/profile-fit-counts', getProfileFitCounts);
// GET /api/discover/profile-fits?fit=Professionals%20%26%20Entrepreneurs
router.get('/profile-fits', discoverByProfileFit);
// GET /api/discover/interests?interests=Music,Prayer
router.get('/interests', discoverByInterests);

export default router;
