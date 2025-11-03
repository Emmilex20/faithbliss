// src/routes/photoRoutes.ts
import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinaryConfig';
import { protect } from '../middleware/authMiddleware';
import { db } from '../config/firebase-admin';

const router = express.Router();
const upload = multer({ storage });

/**
 * @route POST /api/users/me/photo/:photoNumber
 * @desc Upload or replace a specific profile photo (photo 1, 2, etc.)
 * @access Private
 */
router.post('/me/photo/:photoNumber', protect, upload.single('photo'), async (req, res) => {
  try {
    const uid = req.userId; // from protect middleware
    const { photoNumber } = req.params;
    const file = req.file;

    if (!uid) return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // The Cloudinary URL
    const photoUrl = file.path;

    // Save in Firestore under the correct field (e.g. profilePhoto1, profilePhoto2)
    const photoField = `profilePhoto${photoNumber}`;
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ [photoField]: photoUrl });

    return res.status(200).json({
      message: `Photo ${photoNumber} uploaded successfully`,
      photoUrl,
    });
  } catch (error: any) {
    console.error('🔥 Error uploading specific photo:', error);
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
});

export default router;
