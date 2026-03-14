// src/controllers/authController.ts (FIRESTORE/FIREBASE REWRITE)

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase-admin'; // Firestore DB instance
import { DocumentData, DocumentReference } from 'firebase-admin/firestore';
import { Types } from 'mongoose'; // Still used for internal logic, but not for DB IDs anymore
import multer from 'multer';
import { storage } from '../config/cloudinaryConfig'; // Assuming Cloudinary is still used
import { countProfilePhotos, MIN_REQUIRED_PROFILE_PHOTOS } from '../utils/profilePhotos';
import { validateOnboardingPayload } from '../utils/validateOnboardingPayload';


// --- FIRESTORE USER TYPE (Simplified for the controller) ---
// Note: We use the Firebase UID as the document ID.
export interface IUserProfile extends DocumentData {
    id: string; // The Firestore Document ID (which is the Firebase UID)
    name: string;
    email: string;
    role?: string;
    roles?: string[];
    gender: string;
    age: number;
    denomination: string;
    bio?: string;
    location?: string;
    profilePhoto1?: string;
    profilePhoto2?: string;
    profilePhoto3?: string;
    profilePhoto4?: string;
    profilePhoto5?: string;
    profilePhoto6?: string;
    profilePhotoCount?: number;
    onboardingCompleted: boolean;
    profileFits?: string[];
    // Add other fields...
    likes?: string[]; // Array of Firestore UIDs
    passes?: string[];
    matches?: string[];
}
// -----------------------------------------------------------
const PRIMARY_ADMIN_EMAIL = 'aginaemmanuel6@gmail.com';

const resolveUserRole = (email: unknown, role?: unknown): string => {
    if (typeof email === 'string' && email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL) {
        return 'admin';
    }

    if (typeof role === 'string' && role.trim()) {
        return role.trim().toLowerCase();
    }

    return 'user';
};

const resolveUserRoles = (email: unknown, roles?: unknown): string[] => {
    const normalizedRoles = Array.isArray(roles)
        ? roles
            .filter((value): value is string => typeof value === 'string')
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean)
        : [];

    if (typeof email === 'string' && email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL) {
        return Array.from(new Set([...normalizedRoles, 'developer']));
    }

    return Array.from(new Set(normalizedRoles));
};

// Create a Multer instance using the Cloudinary storage engine
const upload = multer({ storage: storage });

const uploadPhotos = upload.fields([
    { name: 'profilePhoto1', maxCount: 1 }, 
    { name: 'profilePhoto2', maxCount: 1 }, 
    { name: 'profilePhoto3', maxCount: 1 }, 
    { name: 'profilePhoto4', maxCount: 1 }, 
    { name: 'profilePhoto5', maxCount: 1 }, 
    { name: 'profilePhoto6', maxCount: 1 }, 
]);

// Helper types for the file object and request with user
interface MulterRequest extends Request {
    files: { [fieldname: string]: Express.Multer.File[] };
}

function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
    );
}

// Helper to safely parse potential JSON strings from FormData (for arrays like interests)
const safeParseJSON = (data: any): string[] => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};


// ----------------------------------------
// 1. Firebase Auth: Profile Creation (Post-Register)
// ----------------------------------------
/**
 * @route POST /api/auth/register-profile
 * @desc Creates the custom Firestore profile for a newly Firebase-registered user.
 * @access Private (Requires Firebase ID Token via protect middleware)
 */
const createProfileAfterFirebaseRegister = async (req: Request, res: Response) => {
    // req.userId is set by the protect middleware (which validates the Firebase token)
    // 🛑 The Firestore Document ID is the Firebase UID
    const uid = req.userId; 
    const { name, email, gender, age, denomination, bio, location } = req.body;

    if (!uid) {
        return res.status(401).json({ message: 'Authentication required: Firebase UID missing.' });
    }
    if (!name || !email || !age || !gender || !denomination || !location) {
        return res.status(400).json({ message: 'Please provide all required profile fields.' });
    }

    try {
        // Check if profile document already exists using the UID
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();
        
        if (doc.exists) {
            return res.status(400).json({ message: 'User profile already exists in Firestore.' });
        }
        
        const profileData: Partial<IUserProfile> = {
            name, 
            email, 
            role: resolveUserRole(email),
            roles: resolveUserRoles(email),
            gender, 
            age: parseInt(age), 
            denomination, 
            bio, 
            location,
            onboardingCompleted: false, // Initial state
            profilePhotoCount: 0,
            createdAt: new Date(),
            likes: [], // Initialize arrays for future use
            passes: [],
            matches: [],
        };
        
        await userRef.set(profileData);

        const newUserProfile = { id: doc.id, ...profileData } as IUserProfile;

        res.status(201).json({
            id: newUserProfile.id, 
            name: newUserProfile.name, 
            email: newUserProfile.email,
            onboardingCompleted: newUserProfile.onboardingCompleted,
            age: newUserProfile.age,
        });

    } catch (error: unknown) { 
        console.error('Registration Profile Error:', error);
        const errorMessage = isErrorWithMessage(error) ? error.message : 'An unknown error occurred during profile creation';
        res.status(500).json({ message: `Server Error: ${errorMessage}` }); 
    }
};


// -----------------------------------------------------------
// 2. Onboarding Controller (Cloudinary Implementation)
// -----------------------------------------------------------
/**
 * @route PUT /auth/complete-onboarding
 * @desc Complete user onboarding, including photo uploads to Cloudinary and profile data update.
 * @access Private
 */
const completeOnboarding = async (req: Request, res: Response) => {
    const files = (req as MulterRequest).files;
    
    // 🔑 CRITICAL: Access the user via req.userId (Firebase UID) from 'protect' middleware.
    const uid = req.userId; // This is the Firestore Document ID

    if (!uid) {
        return res.status(401).json({ message: 'User not authenticated (Firebase UID missing)' });
    }
    
    const userRef: DocumentReference = db.collection('users').doc(uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
        return res.status(404).json({ message: 'User profile not found in database. Please complete initial profile creation.' });
    }
    
    const user = { id: doc.id, ...doc.data() } as IUserProfile;
    
    // Extract all expected fields from the body (Comprehensive)
    const { 
        birthday, location, latitude, longitude, faithJourney, sundayActivity,
        preferredGender, minAge, maxAge, maxDistance,
        lookingFor, hobbies, values, bio, interests, profileFits, ...otherFields
    } = req.body;

    const parsedInterests = safeParseJSON(interests);
    const parsedLookingFor = safeParseJSON(lookingFor);
    const parsedHobbies = safeParseJSON(hobbies);
    const parsedValues = safeParseJSON(values);
    const parsedProfileFits = safeParseJSON(profileFits);

    const updateFields: Partial<IUserProfile> = {
        // General Profile fields
        ...otherFields,
        bio,
        birthday: birthday ? new Date(birthday).toISOString() : undefined, // Firestore friendly
        location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        
        // Faith/Goals
        faithJourney,
        sundayActivity,
        
        // Preferences (Parsed from JSON strings)
        interests: parsedInterests,
        lookingFor: parsedLookingFor,
        hobbies: parsedHobbies,
        values: parsedValues,
        profileFits: profileFits === undefined ? undefined : parsedProfileFits,
        
        // Matching Preferences
        preferredGender,
        minAge: minAge ? parseInt(minAge) : undefined, 
        maxAge: maxAge ? parseInt(maxAge) : undefined, 
        maxDistance: maxDistance ? parseInt(maxDistance) : undefined,

        // 🌟 CRITICAL: Set the completion flag
        onboardingCompleted: true, 
    };

    // Map the uploaded files to the photo URLs, only adding fields that have new files
    for (let i = 1; i <= 6; i++) {
        const fieldName = `profilePhoto${i}`;
        const userPhotoKey = `profilePhoto${i}` as keyof IUserProfile;

        if (files && files[fieldName] && files[fieldName][0]) {
            updateFields[userPhotoKey] = files[fieldName][0].path;
        }
        // NOTE: We don't copy existing photos here. If a field is missing in the upload 
        // and in updateFields, it remains unchanged in Firestore via .update().
    }

    const nextUserSnapshot = { ...user, ...updateFields };
    const profilePhotoCount = countProfilePhotos(nextUserSnapshot);
    if (profilePhotoCount < MIN_REQUIRED_PROFILE_PHOTOS) {
        return res.status(400).json({
            message: `Please upload at least ${MIN_REQUIRED_PROFILE_PHOTOS} profile photos before completing onboarding.`,
        });
    }
    updateFields.profilePhotoCount = profilePhotoCount;

    const validationError = validateOnboardingPayload({
        ...nextUserSnapshot,
        profilePhotoCount,
    } as Record<string, unknown>);

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    // Clean up undefined values (Firestore update ignores undefined, but good practice)
    Object.keys(updateFields).forEach(key => updateFields[key as keyof Partial<IUserProfile>] === undefined && delete updateFields[key as keyof Partial<IUserProfile>]);

    try {
        await userRef.update(updateFields);

        // Fetch the updated document
        const updatedDoc = await userRef.get();
        if (!updatedDoc.exists) {
             return res.status(404).json({ message: 'User not found after update.' });
        }
        
        const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() } as IUserProfile;

        return res.status(200).json({
            message: 'Onboarding complete! Profile updated successfully.',
            user: { 
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                onboardingCompleted: updatedUser.onboardingCompleted,
                profilePhoto1: updatedUser.profilePhoto1,
                profilePhotoCount: updatedUser.profilePhotoCount,
            },
        });

    } catch (error: unknown) {
        const errorMessage = isErrorWithMessage(error) ? error.message : 'An unknown error occurred during onboarding';
        console.error('Onboarding update error:', error);
        res.status(500).json({ message: `Server Error: ${errorMessage}` });
    }
};

// ----------------------------------------
// NO LONGER NEEDED (Replaced by Firebase Auth)
// ----------------------------------------
// const registerUser = ...
// const loginUser = ...
// const logoutUser = ...
// const googleAuth = ...
// const googleAuthCallback = ...

// ----------------------------------------
// FINAL EXPORTS 
// ----------------------------------------
export { 
    uploadPhotos, 
    completeOnboarding,
    createProfileAfterFirebaseRegister 
};
