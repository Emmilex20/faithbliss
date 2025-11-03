// src/components/onboarding/ImageUploadSlide.tsx (VERIFIED - Local logic is fine)

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import type { OnboardingData } from './types'; // Assuming OnboardingData has a 'photos: File[]' field
import React from 'react'; 

interface ImageUploadSlideProps {
    onboardingData: OnboardingData;
    setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
    isVisible: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ImageUploadSlide = ({ onboardingData, setOnboardingData, isVisible }: ImageUploadSlideProps) => {
    const [uploading, setUploading] = useState(false);
    const [photos, setPhotos] = useState<File[]>(onboardingData.photos || []); // Initialize with existing data
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const newPreviews = photos.map(file => URL.createObjectURL(file));
        setPhotoPreviews(newPreviews);
        
        // Cleanup function to revoke object URLs and prevent memory leaks
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [photos]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const files = event.target.files;
        if (!files) return;

        setUploading(true);
        const newFiles = Array.from(files);
        const validFiles: File[] = [];
        
        for (const file of newFiles) {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setError(`Invalid file type: ${file.name}. Please use JPEG, PNG, or WebP.`);
                setUploading(false);
                event.target.value = ''; 
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(`File is too large: ${file.name}. Maximum size is 5MB.`);
                setUploading(false);
                event.target.value = '';
                return;
            }
            validFiles.push(file);
        }

        const combinedPhotos = [...photos, ...validFiles].slice(0, 6);
        setPhotos(combinedPhotos);
        setOnboardingData(prev => ({ ...prev, photos: combinedPhotos }));
        setUploading(false);
        event.target.value = ''; 
    };

    const removePhoto = (indexToRemove: number) => {
        const newPhotos = photos.filter((_, index) => index !== indexToRemove);
        setPhotos(newPhotos);
        setOnboardingData(prev => ({ ...prev, photos: newPhotos }));
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Upload Your Photos 📸</h2>
                <p className="text-gray-400">
                    Add 2-6 photos. The first two are required. Max 5MB each.
                </p>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative flex items-center">
                    <AlertCircle className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photoPreviews.map((previewUrl, index) => (
                    <div key={index} className="relative group w-full h-40">
                        <img 
                            src={previewUrl} 
                            alt={`photo-${index}`} 
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                        <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {photos.length < 6 && (
                    <div className="relative border-2 border-dashed border-gray-600 rounded-lg h-40 flex items-center justify-center">
                        <input
                            type="file"
                            multiple
                            accept={ALLOWED_FILE_TYPES.join(',')}
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading || photos.length >= 6}
                        />
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <UploadCloud size={32} className="mx-auto" />
                                <p>Upload</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {onboardingData.photos.length < 2 && (
                <p className="text-red-500 text-center font-semibold">
                    You must upload at least 2 photos to continue.
                </p>
            )}
        </motion.div>
    );
};

export default ImageUploadSlide;