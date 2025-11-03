import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinaryConfig';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
const upload = multer({ storage });

// Single file upload
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const photoUrl = req.file.path; // Cloudinary URL
    res.status(200).json({ url: photoUrl });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Multiple files
router.post('/upload-photos', protect, upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0)
      return res.status(400).json({ error: 'No files uploaded' });

    const urls = (req.files as Express.Multer.File[]).map((file) => file.path);
    res.status(200).json({ urls });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
