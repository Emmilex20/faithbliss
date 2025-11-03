// src/config/cloudinaryConfig.ts

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary using credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

// Configure the storage engine for Multer
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // This function runs on every file upload
    return {
      folder: 'faithbliss_profiles', // Cloudinary folder name
      format: 'webp', // Automatically convert images to webp for optimization
      public_id: file.originalname.split('.')[0] + '-' + Date.now(),
      transformation: [
        { width: 800, height: 800, crop: 'limit' } // Example transformation
      ],
    };
  },
});

export const cloudinaryUploader = cloudinary;

// We will export the storage object to use with Multer in the routes/controllers