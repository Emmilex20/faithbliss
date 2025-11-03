// src/routes/userRoutes.ts
import express from 'express';
import { getMe, getAllUsers, getUserById, updateUserProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { sessionProtect } from '../middleware/sessionAuthMiddleware';

const router = express.Router();

// 🔹 Get current logged-in user
router.get('/me', protect, getMe);

// 🔹 Update profile info
router.put('/me', protect, updateUserProfile);

// 🔹 Get all users
router.get('/', protect, getAllUsers);

// 🔹 Get single user by ID
router.get('/:id', protect, getUserById);

export default router;
