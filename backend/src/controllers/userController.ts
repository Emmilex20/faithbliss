// src/controllers/userController.ts (FIRESTORE REWRITE)

import { Request, Response } from 'express'; 
import { db, usersCollection } from '../config/firebase-admin'; // Firestore Import
import * as admin from 'firebase-admin'; // Admin SDK for types

// Interface for the Firestore Profile
interface IFirestoreUser {
    // Note: The Firestore document ID is the Firebase UID
    name: string;
    email: string;
    profilePhoto1: string;
    onboardingCompleted: boolean;
    age: number;
    gender: string;
    location: string;
    bio: string;
    denomination: string;
    likes?: string[];
    matches?: string[];
    // ... all other fields
}

// Extend Request type to include the Firebase UID
interface CustomRequest extends Request {
    userId?: string; // Populated by the Firebase Auth Middleware (Firebase UID)
}

// Helper to determine if an error has a message property
function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' && 
        error !== null && 
        'message' in error && 
        typeof (error as { message: unknown }).message === 'string'
    );
}

// Helper to fetch the current user's profile from Firestore
const fetchUserProfile = async (firebaseUid: string, res: Response): Promise<(IFirestoreUser & { firebaseUid: string }) | null> => {
    try {
        const userDoc = await usersCollection.doc(firebaseUid).get();
        
        if (!userDoc.exists) {
            res.status(404).json({ message: 'User profile not found in Firestore. Please complete profile creation.' });
            return null;
        }

        // Return data combined with the Firestore document ID (which is the Firebase UID)
        return { ...userDoc.data() as IFirestoreUser, firebaseUid: userDoc.id };

    } catch (error) {
        const errorMessage = isErrorWithMessage(error) ? error.message : 'An unknown error occurred';
        console.error('Firestore fetch error:', error);
        res.status(500).json({ message: `Server Error fetching user profile: ${errorMessage}` });
        return null;
    }
}


/**
 * @route GET /users/me
 * @desc Get the profile data of the currently authenticated user
 * @access Private
 */
const getMe = async (req: CustomRequest, res: Response) => {
    const firebaseUid = req.userId;

    if (!firebaseUid) {
        return res.status(401).json({ message: 'Authentication required: Firebase UID missing.' });
    }

    const user = await fetchUserProfile(firebaseUid, res);
    if (!user) return; // Response handled by helper

    // 3. Return full profile data so edits persist on reload
    const { firebaseUid: uid, ...userData } = user as any;
    return res.status(200).json({
        id: uid,
        firebaseUid: uid,
        ...userData,
    });
};

/**
 * @route GET /users/:id
 * @desc Get a single user's profile data by ID (for profile view)
 * @access Private
 * NOTE: Since we are using Firestore, the ID in the route param should be the Firebase UID.
 */
const getUserById = async (req: CustomRequest, res: Response) => {
    // The ID here must be the Firebase UID (the Firestore document ID)
    const userId = req.params.id; 

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'Invalid user ID format (must be Firebase UID).' });
    }

    try {
        // Fetch by Firebase UID (Document ID)
        const userDoc = await usersCollection.doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        const user = userDoc.data() as IFirestoreUser;

        // Return only necessary profile fields
        return res.status(200).json({
            id: userDoc.id, 
            name: user.name,
            profilePhoto1: user.profilePhoto1,
            age: user.age,
            gender: user.gender,
            location: user.location,
            bio: user.bio,
            denomination: user.denomination,
        });

    } catch (error) {
        const errorMessage = isErrorWithMessage(error) ? error.message : 'An unknown error occurred';
        console.error('Error fetching user by ID:', error);
        return res.status(500).json({ message: `Failed to retrieve user profile: ${errorMessage}` });
    }
};


/**
 * @route GET /users
 * @desc Get a paginated list of all users
 * @access Private
 */
const getAllUsers = async (req: CustomRequest, res: Response) => {
    const firebaseUid = req.userId;

    if (!firebaseUid) {
        return res.status(401).json({ message: 'Unauthorized: Missing user context.' });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    try {
        // Firestore doesn't have a built-in total count for a query, 
        // and pagination requires starting/ending cursors for large sets.
        // We'll use a simple offset/limit which is okay for small collections.

        const snapshot = await usersCollection
            .where('onboardingCompleted', '==', true) 
            .limit(limit)
            .offset(skip)
            .get();
        
        // Count documents for pagination (Inefficient in Firestore, but required for the UX)
        // NOTE: A real-world app would use a counter document for scalability.
        const totalDocumentsSnapshot = await usersCollection
            .where('onboardingCompleted', '==', true)
            .get();
        const totalDocuments = totalDocumentsSnapshot.size;

        const totalPages = Math.ceil(totalDocuments / limit);

        // Filter out the current user in memory (since Firestore lacks a NOT IN query against itself)
        const users = snapshot.docs
            .map(doc => ({ ...doc.data() as IFirestoreUser, id: doc.id }))
            .filter(user => user.id !== firebaseUid);
            
        
        return res.status(200).json({
            users: users.map(user => ({
                id: user.id,
                name: user.name,
                profilePhoto1: user.profilePhoto1,
                age: user.age,
                gender: user.gender,
                location: user.location,
                bio: user.bio,
                denomination: user.denomination,
            })),
            totalPages: totalPages,
            currentPage: page,
        });

    } catch (error) {
        const errorMessage = isErrorWithMessage(error) ? error.message : 'An unknown error occurred';
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: `Failed to retrieve user list: ${errorMessage}` });
    }
};

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).userId; // from protect middleware
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const updates = req.body;
    const userRef = db.collection('users').doc(uid);

    await userRef.update(updates);

    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedData,
    });
  } catch (error: any) {
    console.error('🔥 Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
};


const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).userId;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const settings = req.body || {};
    const userRef = db.collection('users').doc(uid);

    await userRef.set(
      {
        settings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ message: 'Settings updated successfully.' });
  } catch (error: any) {
    console.error('?? Error updating settings:', error);
    return res.status(500).json({ message: error.message });
  }
};

const deactivateAccount = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).userId;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const userRef = db.collection('users').doc(uid);
    await userRef.set(
      {
        isActive: false,
        deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ message: 'Account deactivated successfully.' });
  } catch (error: any) {
    console.error('?? Error deactivating account:', error);
    return res.status(500).json({ message: error.message });
  }
};

const reactivateAccount = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).userId;
    if (!uid) return res.status(401).json({ message: 'Unauthorized' });

    const userRef = db.collection('users').doc(uid);
    await userRef.set(
      {
        isActive: true,
        reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ message: 'Account reactivated successfully.' });
  } catch (error: any) {
    console.error('?? Error reactivating account:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------
// FINAL EXPORTS 
// ----------------------------------------
export { getMe, getUserById, getAllUsers, updateUserProfile, updateUserSettings, deactivateAccount, reactivateAccount };
