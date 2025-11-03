// src/middleware/uploadMiddleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Node's file system module

// Define the absolute path for file storage
const uploadDir = path.join(__dirname, '../../uploads/photos');

// Create the upload directory if it doesn't exist
// This is important for Multer's diskStorage to work correctly.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Configure Storage
const storage = multer.diskStorage({
    // Sets the destination directory for the files
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    // Sets the file name to prevent clashes
    filename: (req, file, cb) => {
        // Example: photo-1730073600000-originalName.jpg
        cb(null, `photo-${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
    },
});

// 2. Configure Multer Instance
export const uploadPhotos = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5 MB maximum file size
    }, 
    fileFilter: (req, file, cb) => {
        // Check file type to ensure it's an image
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            // Accept the file
            return cb(null, true);
        }
        // Reject the file
        cb(new Error('Only images (jpeg, jpg, png, gif) are allowed') as any); 
        // Note: Multer's type definition for cb requires a slight hack with 'as any'
        // for passing an Error object in some environments.
    },
});

// REMINDER: This middleware is used in authRoutes.ts like this:
// router.put('/complete-onboarding', protect, uploadPhotos.array('photos', 6), completeOnboarding);