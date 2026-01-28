// src/routes/userRoutes.ts
import express from 'express';
import {
  getMe,
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateUserSettings,
  deactivateAccount,
  reactivateAccount,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Get current logged-in user
router.get('/me', protect, getMe);

// Update profile info
router.put('/me', protect, updateUserProfile);

// Update settings
router.patch('/me/settings', protect, updateUserSettings);

// Deactivate/reactivate account
router.post('/me/deactivate', protect, deactivateAccount);
router.post('/me/reactivate', protect, reactivateAccount);

// Get all users
router.get('/', protect, getAllUsers);

// Get single user by ID
router.get('/:id', protect, getUserById);

export default router;
