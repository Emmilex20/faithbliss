import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinaryConfig';
import { protect } from '../middleware/authMiddleware';
import { db } from '../config/firebase-admin';

const router = express.Router();

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    const error = new Error('Invalid image type. Use JPEG, PNG, or WebP.') as Error & { statusCode?: number };
    error.statusCode = 400;
    cb(error);
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_PHOTO_SIZE_BYTES },
  fileFilter: imageFileFilter,
});

const isValidPhotoNumber = (value: string): boolean => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 6;
};

router.post('/me/photo/:photoNumber', protect, upload.single('photo'), async (req, res) => {
  try {
    const uid = req.userId;
    const { photoNumber } = req.params;
    const file = req.file;

    if (!uid) return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    if (!isValidPhotoNumber(photoNumber)) return res.status(400).json({ message: 'Invalid photo slot. Use 1 to 6.' });
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const photoUrl = file.path;
    const photoField = `profilePhoto${photoNumber}`;
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ [photoField]: photoUrl });

    return res.status(200).json({
      message: `Photo ${photoNumber} uploaded successfully`,
      photoUrl,
    });
  } catch (error: unknown) {
    const knownError = error as { message?: string };
    console.error('Error uploading specific photo:', knownError);
    return res.status(500).json({ message: 'Error uploading photo', error: knownError.message || 'Unknown error' });
  }
});

router.delete('/me/photo/:photoNumber', protect, async (req, res) => {
  try {
    const uid = req.userId;
    const { photoNumber } = req.params;

    if (!uid) return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    if (!isValidPhotoNumber(photoNumber)) return res.status(400).json({ message: 'Invalid photo slot. Use 1 to 6.' });

    const photoField = `profilePhoto${photoNumber}`;
    const userRef = db.collection('users').doc(uid);

    await userRef.update({ [photoField]: null });

    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data() || {};

    return res.status(200).json({
      message: `Photo ${photoNumber} removed successfully`,
      photoNumber: Number(photoNumber),
      photos: {
        profilePhoto1: updatedData.profilePhoto1 || null,
        profilePhoto2: updatedData.profilePhoto2 || null,
        profilePhoto3: updatedData.profilePhoto3 || null,
        profilePhoto4: updatedData.profilePhoto4 || null,
        profilePhoto5: updatedData.profilePhoto5 || null,
        profilePhoto6: updatedData.profilePhoto6 || null,
      },
    });
  } catch (error: unknown) {
    const knownError = error as { message?: string };
    console.error('Error removing photo:', knownError);
    return res.status(500).json({ message: 'Error removing photo', error: knownError.message || 'Unknown error' });
  }
});

export default router;
