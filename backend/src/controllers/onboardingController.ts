// src/controllers/onboardingController.ts (FIRESTORE/FIREBASE REWRITE - ROBUST NUMERICAL PARSING)

import { Request, Response } from 'express';
import { admin, usersCollection } from '../config/firebase-admin';
import { DocumentData } from 'firebase-admin/firestore'; 

// --- FIRESTORE USER TYPE ---
interface IUserProfile extends DocumentData {
    id: string; // The Firestore Document ID (which is the Firebase UID)
    name: string;
    email: string;
    profilePhoto1?: string;
    onboardingCompleted: boolean;
    // ... all other fields
    latitude?: number | null;
    longitude?: number | null;
    minAge?: number;
    maxAge?: number;
    maxDistance?: number;
}
// ----------------------------------------------------------------------

// 💡 FIX: Define a temporary type for the Multer file structure with required fields
interface UploadedFile extends Express.Multer.File {
    secure_url?: string; // Property added by Cloudinary/S3
    path: string;        // Property added by local disk (Multer requires this to be present)
}

// Helper function to safely parse potential JSON strings from FormData
const safeParseJSON = (data: any): string[] => {
    if (typeof data === 'string') {
        try {
            if (data.trim() === '') return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse JSON string:', data);
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

// Helper for Multer request files (type assertion for req.files property)
type MulterFiles = { [fieldname: string]: UploadedFile[] };

// 🌟 CRITICAL FIX: Helper function for robust number parsing
const parseNumber = (val: any): number | undefined => {
    // Return undefined if the value is null, undefined, or an empty string
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        return undefined;
    }
    // Attempt to parse the float
    const num = parseFloat(val);
    // Return the number if valid, otherwise return undefined
    return isNaN(num) ? undefined : num;
};

// Helper to parse integers (for age/distance)
const parseInteger = (val: any): number | undefined => {
    const num = parseNumber(val);
    return num === undefined ? undefined : Math.round(num);
}


/**
 * Handles the final submission of the onboarding form data.
 */
export const completeOnboarding = async (req: Request, res: Response) => {
    const files = req.files as MulterFiles;
    
    const uid = req.userId;

    if (!uid) {
        return res.status(401).json({ message: 'User not authenticated (Firebase UID missing).' });
    }
    
    try {
        const userRef = usersCollection.doc(uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ message: 'User profile not found in database. Please complete initial profile creation.' });
        }
        
        // 1. Extract body data and prepare base update object
        const { 
            birthday, location, latitude, longitude, faithJourney, sundayActivity,
            preferredGender, minAge, maxAge, maxDistance,
            relationshipGoals, hobbies, values, bio, interests,
            churchAttendance, denomination, occupation, education, baptismStatus,
            spiritualGifts, lifestyle, favoriteVerse, phoneNumber, countryCode,
            preferredFaithJourney, preferredChurchAttendance, preferredRelationshipGoals, preferredDenomination,
            ...otherFields
        } = req.body;

        const updateFields: Partial<IUserProfile> = {
            ...otherFields,
            bio, occupation, education, baptismStatus, favoriteVerse,
            phoneNumber, countryCode, lifestyle, denomination,
            
            // Date parsing
            birthday: birthday && typeof birthday === 'string' ? new Date(birthday).toISOString() : undefined,
            
            location,
            
            // 🌟 CRITICAL FIX: Use robust parsers for all numerical fields
            latitude: parseNumber(latitude),
            longitude: parseNumber(longitude),
            
            faithJourney,
            churchAttendance: sundayActivity || churchAttendance,
            
            // List Fields (Parsed from JSON strings)
            relationshipGoals: safeParseJSON(relationshipGoals), hobbies: safeParseJSON(hobbies),
            values: safeParseJSON(values), interests: safeParseJSON(interests),
            spiritualGifts: safeParseJSON(spiritualGifts),
            
            // Preferences
            preferredGender, preferredFaithJourney, preferredChurchAttendance,
            preferredRelationshipGoals, preferredDenomination,

            // Matching Preferences (Parsed to integers)
            minAge: parseInteger(minAge), 
            maxAge: parseInteger(maxAge), 
            maxDistance: parseInteger(maxDistance),
        };

        // 2. Map the uploaded files to the photo URLs
        for (let i = 1; i <= 6; i++) {
            const fieldName = `profilePhoto${i}`;
            const userPhotoKey = `profilePhoto${i}` as keyof IUserProfile;

            if (files && files[fieldName] && files[fieldName][0]) {
                const fileUrl = files[fieldName][0].secure_url || files[fieldName][0].path; 
                
                if (fileUrl) {
                    updateFields[userPhotoKey] = fileUrl;
                } else {
                    console.warn(`File URL missing for ${fieldName}. Check Multer configuration.`);
                }
            }
        }
        
        // Clean up undefined values (ensures fields not provided are not set to 'undefined')
        Object.keys(updateFields).forEach(key => (updateFields as any)[key] === undefined && delete (updateFields as any)[key]);

        // 3. Update the User Document with all profile data and photo URLs
        updateFields.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await userRef.update(updateFields);

        // 4. Set the completion flag only AFTER the main data update is successful
        await userRef.update({ 
            onboardingCompleted: true, 
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 5. Fetch the updated document (optional, for response data)
        const updatedDoc = await userRef.get();
        if (!updatedDoc.exists) {
             return res.status(404).json({ message: 'User not found after update.' });
        }
        
        const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() } as IUserProfile;

        // 6. Success Response
        return res.status(200).json({
            message: 'Onboarding complete! Profile and photos updated successfully.',
            user: { 
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                onboardingCompleted: updatedUser.onboardingCompleted,
                profilePhoto1: updatedUser.profilePhoto1,
            },
        });

    } catch (error) {
        console.error('Onboarding submission error:', error);
        res.status(500).json({ message: 'Failed to complete onboarding due to a server error.', error: (error as Error).message });
    }
};