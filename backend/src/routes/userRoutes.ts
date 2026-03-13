// src/routes/userRoutes.ts
import express from 'express';
import {
  getMe,
  getAllUsers,
  getAdminPlatformStats,
  getUserById,
  getOnboardingDebug,
  updateUserProfile,
  updateUserSettings,
  updatePassportSettings,
  activateProfileBooster,
  getFeatureSettings,
  updateFeatureSettings,
  updateUserRole,
  updateUserByAdmin,
  resetUserPasswordByAdmin,
  deleteUserByAdmin,
  deactivateAccount,
  reactivateAccount,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Get current logged-in user
router.get('/me', protect, getMe);
router.get('/me/onboarding-debug', protect, getOnboardingDebug);

// Update profile info
router.put('/me', protect, updateUserProfile);

// Update settings
router.patch('/me/settings', protect, updateUserSettings);
router.patch('/me/passport', protect, updatePassportSettings);
router.post('/me/profile-booster/activate', protect, activateProfileBooster);
router.get('/feature-settings', protect, getFeatureSettings);
router.get('/admin/platform-stats', protect, getAdminPlatformStats);
router.patch('/feature-settings', protect, updateFeatureSettings);
router.patch('/:id/role', protect, updateUserRole);
router.patch('/:id', protect, updateUserByAdmin);
router.post('/:id/reset-password', protect, resetUserPasswordByAdmin);
router.delete('/:id', protect, deleteUserByAdmin);

// Deactivate/reactivate account
router.post('/me/deactivate', protect, deactivateAccount);
router.post('/me/reactivate', protect, reactivateAccount);

// Get all users
router.get('/', protect, getAllUsers);

// Debug onboarding document
router.get('/:id/onboarding-debug', protect, getOnboardingDebug);

// Get single user by ID
router.get('/:id', protect, getUserById);

export default router;
