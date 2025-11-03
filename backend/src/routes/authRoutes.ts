// src/routes/authRoutes.ts (FIREBASE/FIRESTORE REWRITE)

import express from 'express';
// passport is no longer needed since local/google auth is replaced by Firebase Auth
// import passport from 'passport'; 
import { 
    // REMOVED: registerUser, loginUser, logoutUser 
    uploadPhotos,      
    completeOnboarding, 
    createProfileAfterFirebaseRegister, 
} from '../controllers/authController'; 
import { protect } from '../middleware/authMiddleware'; 

const router = express.Router();

// ----------------------------------------
// 1. 🔑 Firebase Profile Creation Route
// ----------------------------------------
/**
 * @route POST /api/auth/register-profile
 * @desc Creates the initial Firestore user profile document after a user successfully 
 * registers with Firebase Auth (client-side).
 * @access Private (Requires Firebase ID Token via 'protect' middleware)
 */
router.post('/register-profile', protect, createProfileAfterFirebaseRegister);

// ----------------------------------------
// 2. 📝 Onboarding Route
// ----------------------------------------
/**
 * @route PUT /api/auth/complete-onboarding
 * @desc Completes the user profile, including photo uploads and final form data.
 * @access Private (Requires Firebase ID Token via 'protect' middleware)
 */
router.put(
    '/complete-onboarding', 
    protect, 
    uploadPhotos, // Multer middleware for file uploads
    completeOnboarding 
);

// ----------------------------------------
// 🛑 DEPRECATED ROUTES REMOVED 
// (Local Auth: /register, /login, /logout)
// (Google OAuth: /google, /google/callback)
// ----------------------------------------

export default router;